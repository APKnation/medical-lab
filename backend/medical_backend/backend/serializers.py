from rest_framework import serializers

from .models import (
    Staff,
    LabTest,
    Patient,
    PatientTest,
    TestResultParameter,
    MedicalSession,
)


# ============================================================
# STAFF SERIALIZER
# ============================================================

class StaffSerializer(serializers.ModelSerializer):
    class Meta:
        model = Staff
        fields = (
            'id',
            'username',
            'password',
            'name',
            'role',
            'designation',
            'is_active',
        )
        extra_kwargs = {
            'password': {
                'write_only': True,
                'required': False,
            }
        }

    def create(self, validated_data):
        password = validated_data.pop('password', None)

        staff = Staff(**validated_data)

        if password:
            staff.set_password(password)

        staff.save()

        return staff

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if password:
            instance.set_password(password)

        instance.save()

        return instance


# ============================================================
# TEST RESULT PARAMETER SERIALIZER
# ============================================================

class TestResultParameterSerializer(serializers.ModelSerializer):
    flag = serializers.SerializerMethodField()

    class Meta:
        model = TestResultParameter
        fields = (
            'id',
            'name',
            'value',
            'unit',
            'normalRange',
            'flag',
        )
        read_only_fields = ('id', 'flag')

    def get_flag(self, obj):
        return TestResultParameter.calculate_flag(
            obj.value,
            obj.normalRange
        )


# ============================================================
# PATIENT TEST SERIALIZER
# ============================================================

class PatientTestSerializer(serializers.ModelSerializer):
    parameters = TestResultParameterSerializer(
        many=True,
        required=False
    )

    class Meta:
        model = PatientTest
        fields = (
            'id',
            'testCode',
            'testName',
            'category',
            'status',
            'completedAt',
            'completedBy',
            'parameters',
        )
        read_only_fields = (
            'id',
            'completedAt',
        )

    def create(self, validated_data):
        parameters_data = validated_data.pop(
            'parameters',
            []
        )

        patient = self.context.get('patient')

        if patient is None:
            raise serializers.ValidationError({
                'patient': 'Patient is required.'
            })

        test = PatientTest.objects.create(
            patient=patient,
            **validated_data
        )

        for parameter_data in parameters_data:
            TestResultParameter.objects.create(
                test=test,
                **parameter_data
            )

        return test

    def update(self, instance, validated_data):
        parameters_data = validated_data.pop(
            'parameters',
            None
        )

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()

        if parameters_data is not None:
            instance.parameters.all().delete()

            for parameter_data in parameters_data:
                TestResultParameter.objects.create(
                    test=instance,
                    **parameter_data
                )

        return instance


# ============================================================
# PATIENT SERIALIZER
# ============================================================

class PatientSerializer(serializers.ModelSerializer):
    tests = PatientTestSerializer(
        many=True,
        required=False
    )

    class Meta:
        model = Patient

        fields = (
            'id',
            'patientId',
            'name',
            'age',
            'gender',
            'contact',
            'address',
            'doctorName',
            'doctorContact',
            'referredFrom',
            'status',
            'priority',
            'dateRegistered',
            'dateCompleted',
            'notes',
            'createdBy',
            'tests',
        )

        read_only_fields = (
            'id',
            'patientId',
            'dateRegistered',
            'dateCompleted',
        )

    def create(self, validated_data):
        tests_data = validated_data.pop(
            'tests',
            []
        )

        patient = Patient.objects.create(
            **validated_data
        )

        for test_data in tests_data:
            parameters_data = test_data.pop(
                'parameters',
                []
            )

            patient_test = PatientTest.objects.create(
                patient=patient,
                **test_data
            )

            for parameter_data in parameters_data:
                TestResultParameter.objects.create(
                    test=patient_test,
                    **parameter_data
                )

        return patient

    def update(self, instance, validated_data):
        tests_data = validated_data.pop(
            'tests',
            None
        )

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()

        if tests_data is not None:
            # Remove existing tests
            instance.tests.all().delete()

            # Recreate tests
            for test_data in tests_data:
                parameters_data = test_data.pop(
                    'parameters',
                    []
                )

                patient_test = PatientTest.objects.create(
                    patient=instance,
                    **test_data
                )

                for parameter_data in parameters_data:
                    TestResultParameter.objects.create(
                        test=patient_test,
                        **parameter_data
                    )

        return instance


# ============================================================
# LAB TEST SERIALIZER
# ============================================================

class LabTestSerializer(serializers.ModelSerializer):
    class Meta:
        model = LabTest

        fields = (
            'id',
            'code',
            'name',
            'category',
            'turnaroundTime',
            'sampleType',
            'description',
            'parameters',
        )

        read_only_fields = ('id',)


# ============================================================
# MEDICAL SESSION SERIALIZER
# ============================================================

class MedicalSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = MedicalSession

        fields = (
            'id',
            'user',
            'token',
            'created_at',
            'expires_at',
        )

        read_only_fields = (
            'id',
            'user',
            'created_at',
            'expires_at',
        )