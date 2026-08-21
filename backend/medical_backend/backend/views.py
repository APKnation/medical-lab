from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils import timezone
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from rest_framework import status, viewsets, permissions, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from datetime import datetime, timedelta
import secrets
from .models import Staff, LabTest, Patient, PatientTest, TestResultParameter, MedicalSession
from .serializers import StaffSerializer, LabTestSerializer, PatientSerializer, PatientTestSerializer, TestResultParameterSerializer, MedicalSessionSerializer


class StaffLoginView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        
        try:
            staff = Staff.objects.get(username=username)
            if staff.check_password(password):
                refresh = RefreshToken.for_user(staff)
                session = MedicalSession.objects.create(
                    user=staff,
                    token=str(refresh.access_token),
                    expires_at=datetime.now() + timedelta(hours=24)
                )
                
                return Response({
                    'success': True,
                    'user': {
                        'id': staff.id,
                        'username': staff.username,
                        'name': staff.name,
                        'role': staff.role,
                        'designation': staff.designation
                    },
                    'access_token': str(refresh.access_token),
                    'refresh_token': str(refresh),
                    'session_token': session.token
                })
            else:
                return Response({
                    'success': False,
                    'message': 'Invalid credentials'
                }, status=status.HTTP_401_UNAUTHORIZED)
        except Staff.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Invalid credentials'
            }, status=status.HTTP_401_UNAUTHORIZED)


class StaffLogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        session_token = request.data.get('session_token')
        if session_token:
            try:
                session = MedicalSession.objects.get(token=session_token)
                session.delete()
            except MedicalSession.DoesNotExist:
                pass
        
        return Response({'success': True})


class StaffViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Staff.objects.all()
    serializer_class = StaffSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def accounts(self, request):
        accounts = Staff.objects.all().values('id', 'username', 'name', 'role', 'designation')
        return Response(list(accounts))


class LabTestViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = LabTest.objects.all()
    serializer_class = LabTestSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def categories(self, request):
        categories = LabTest.get_categories()
        return Response(categories)
    
    @action(detail=False, methods=['get'])
    def default_parameters(self, request):
        test_code = request.query_params.get('test_code')
        gender = request.query_params.get('gender', '')
        
        if test_code:
            parameters = LabTest.get_default_parameters(test_code, gender)
            return Response(parameters)
        
        return Response([])


class PatientViewSet(viewsets.ModelViewSet):
    queryset = Patient.objects.all()
    serializer_class = PatientSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.role == 'Admin':
            return Patient.objects.all()
        elif self.request.user.role == 'Lab Technician':
            return Patient.objects.filter(tests__completedBy=self.request.user.username)
        else:
            return Patient.objects.filter(createdBy=self.request.user.username)
    
    def perform_create(self, serializer):
        patient = serializer.save(createdBy=self.request.user.username)
        
        tests_data = serializer.validated_data.get('tests', [])
        for test_data in tests_data:
            PatientTest.objects.create(
                patient=patient,
                testCode=test_data.get('testCode'),
                testName=test_data.get('testName'),
                category=test_data.get('category'),
                status=test_data.get('status', 'Pending'),
                completedBy=test_data.get('completedBy')
            )
    
    @action(detail=True, methods=['post'])
    def recalculate_status(self, request, pk=None):
        patient = self.get_object()
        patient.update_status()
        return Response({'success': True, 'status': patient.status})
    
    @action(detail=True, methods=['get'])
    def stats(self, request, pk=None):
        patient = self.get_object()
        stats = patient.get_stats()
        return Response(stats)


class PatientTestViewSet(viewsets.ModelViewSet):
    queryset = PatientTest.objects.all()
    serializer_class = PatientTestSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.role in ['Admin', 'Lab Technician']:
            return PatientTest.objects.all()
        else:
            return PatientTest.objects.filter(patient__createdBy=self.request.user.username)
    
    @action(detail=True, methods=['post'])
    def update_parameters(self, request, pk=None):
        test = self.get_object()
        parameters_data = request.data.get('parameters', [])
        
        for param_data in parameters_data:
            if 'id' in param_data:
                try:
                    param = TestResultParameter.objects.get(id=param_data['id'])
                    param.value = param_data['value']
                    param.flag = TestResultParameter.calculate_flag(param_data['value'], param.normalRange)
                    param.save()
                except TestResultParameter.DoesNotExist:
                    pass
            
            TestResultParameter.calculate_flag(param_data['value'], param_data.get('normalRange', ''))
        
        test.status = 'In Progress'
        test.save()
        
        patient = test.patient
        patient.update_status()
        
        return Response({'success': True})
    
    @action(detail=True, methods=['post'])
    def complete_test(self, request, pk=None):
        test = self.get_object()
        test.status = 'Completed'
        test.completedAt = timezone.now()
        test.completedBy = self.request.user.username
        test.save()
        
        patient = test.patient
        patient.update_status()
        
        return Response({'success': True})


class TestResultParameterViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = TestResultParameter.objects.all()
    serializer_class = TestResultParameterSerializer
    permission_classes = [permissions.IsAuthenticated]


class DashboardStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        today = timezone.now().date()
        
        stats = {
            'total': Patient.objects.count(),
            'pending': Patient.objects.filter(status='Pending').count(),
            'inProgress': Patient.objects.filter(status='In Progress').count(),
            'completed': Patient.objects.filter(status='Completed').count(),
            'todayCount': Patient.objects.filter(dateRegistered__date=today).count(),
            'urgent': Patient.objects.filter(priority='Urgent').count(),
        }
        
        return Response(stats)
