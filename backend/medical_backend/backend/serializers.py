from rest_framework import serializers


class StaffSerializer(serializers.ModelSerializer):
    class Meta:
        model = Staff
        fields = ('id', 'username', 'password', 'name', 'role', 'designation', 'is_active')
        extra_kwargs = {'password': {'write_only': True}}
    
    def create(self, validated_data):
        password = validated_data.pop('password')
        staff = Staff(**validated_data)
        staff.set_password(password)
        staff.save()
        return staff


class TestResultParameterSerializer(serializers.ModelSerializer):
    flag = serializers.SerializerMethodField()
    
    class Meta:
        model = TestResultParameter
        fields = ('id', 'name', 'value', 'unit', 'normalRange', 'flag')
    
    def get_flag(self, obj):
        return TestResultParameter.calculate_flag(obj.value, obj.normalRange)


class PatientTestSerializer(serializers.ModelSerializer):
    parameters = TestResultParameterSerializer(many=True, read_only=True)
    
    class Meta:
        model = PatientTest
        fields = ('id', 'testCode', 'testName', 'category', 'status', 'completedAt', 'completedBy', 'parameters')
    
    def create(self, validated_data):
        test_data = validated_data.copy()
        patient = self.context['patient']
        
        test = PatientTest(
            patient=patient,
            testCode=test_data.get('testCode'),
            testName=test_data.get('testName'),
            category=test_data.get('category'),
            status=test_data.get('status', 'Pending'),
            completedBy=test_data.get('completedBy')
        )
        test.save()
        
        test_parameters = test_data.get('parameters', [])
        for param_data in test_parameters:
            param = TestResultParameter.objects.create(
                test=test,
                name=param_data['name'],
                value=param_data['value'],
                unit=param_data['unit'],
                normalRange=param_data['normalRange'],
                flag=TestResultParameter.calculate_flag(param_data['value'], param_data['normalRange'])
            )
        
        return test


class PatientSerializer(serializers.ModelSerializer):
    tests = PatientTestSerializer(many=True, read_only=True)
    
    class Meta:
        model = Patient
        fields = ('id', 'patientId', 'name', 'age', 'gender', 'contact', 'address', 'doctorName', 'doctorContact', 'referredFrom', 'status', 'priority', 'dateRegistered', 'dateCompleted', 'notes', 'createdBy', 'tests')
    
    def create(self, validated_data):
        tests_data = validated_data.pop('tests', [])
        patient = Patient.objects.create(**validated_data)
        
        for test_data in tests_data:
            test_serializer = PatientTestSerializer(data=test_data)
            if test_serializer.is_valid():
                test_serializer.save(patient=patient)
        
        return patient


class LabTestSerializer(serializers.ModelSerializer):
    class Meta:
        model = LabTest
        fields = ('id', 'code', 'name', 'category', 'turnaroundTime', 'sampleType', 'description', 'parameters')


class MedicalSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = MedicalSession
        fields = ('id', 'user', 'token', 'created_at', 'expires_at')
        read_only_fields = ('user', 'created_at', 'expires_at')