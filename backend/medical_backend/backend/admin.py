from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import (
    Staff,
    LabTest,
    Patient,
    PatientTest,
    TestResultParameter,
    MedicalSession,
)


# ============================================================
# STAFF ADMIN
# ============================================================

@admin.register(Staff)
class StaffAdmin(UserAdmin):

    list_display = (
        'id',
        'username',
        'name',
        'role',
        'designation',
        'is_active',
        'is_staff',
        'is_superuser',
    )

    list_filter = (
        'role',
        'is_active',
        'is_staff',
        'is_superuser',
    )

    search_fields = (
        'id',
        'username',
        'name',
        'designation',
    )

    ordering = ('username',)

    fieldsets = (
        ('Login Information', {
            'fields': (
                'username',
                'password',
            )
        }),

        ('Personal Information', {
            'fields': (
                'name',
                'email',
            )
        }),

        ('Staff Information', {
            'fields': (
                'role',
                'designation',
            )
        }),

        ('Permissions', {
            'fields': (
                'is_active',
                'is_staff',
                'is_superuser',
                'groups',
                'user_permissions',
            )
        }),

        ('Important Dates', {
            'fields': (
                'last_login',
                'date_joined',
            )
        }),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': (
                'id',
                'username',
                'password1',
                'password2',
                'name',
                'email',
                'role',
                'designation',
                'is_active',
                'is_staff',
            ),
        }),
    )


# ============================================================
# LAB TEST ADMIN
# ============================================================

@admin.register(LabTest)
class LabTestAdmin(admin.ModelAdmin):

    list_display = (
        'id',
        'code',
        'name',
        'category',
        'turnaroundTime',
        'sampleType',
    )

    list_filter = (
        'category',
    )

    search_fields = (
        'code',
        'name',
        'category',
        'sampleType',
    )

    ordering = (
        'category',
        'name',
    )


# ============================================================
# PATIENT ADMIN
# ============================================================

@admin.register(Patient)
class PatientAdmin(admin.ModelAdmin):

    list_display = (
        'patientId',
        'name',
        'age',
        'gender',
        'contact',
        'status',
        'priority',
        'dateRegistered',
        'createdBy',
    )

    list_filter = (
        'gender',
        'status',
        'priority',
        'dateRegistered',
    )

    search_fields = (
        'patientId',
        'name',
        'contact',
        'doctorName',
        'doctorContact',
        'referredFrom',
    )

    readonly_fields = (
        'id',
        'patientId',
        'dateRegistered',
        'dateCompleted',
    )

    ordering = (
        '-dateRegistered',
    )


# ============================================================
# PATIENT TEST ADMIN
# ============================================================

@admin.register(PatientTest)
class PatientTestAdmin(admin.ModelAdmin):

    list_display = (
        'id',
        'patient',
        'testCode',
        'testName',
        'category',
        'status',
        'completedAt',
        'completedBy',
    )

    list_filter = (
        'status',
        'category',
        'completedAt',
    )

    search_fields = (
        'id',
        'testCode',
        'testName',
        'patient__patientId',
        'patient__name',
        'completedBy',
    )

    readonly_fields = (
        'id',
    )

    ordering = (
        '-completedAt',
    )


# ============================================================
# TEST RESULT PARAMETER ADMIN
# ============================================================

@admin.register(TestResultParameter)
class TestResultParameterAdmin(admin.ModelAdmin):

    list_display = (
        'id',
        'test',
        'name',
        'value',
        'unit',
        'normalRange',
        'flag',
    )

    list_filter = (
        'flag',
        'unit',
    )

    search_fields = (
        'name',
        'value',
        'normalRange',
        'test__testName',
        'test__patient__name',
        'test__patient__patientId',
    )

    readonly_fields = (
        'flag',
    )

    ordering = (
        '-id',
    )


# ============================================================
# MEDICAL SESSION ADMIN
# ============================================================

@admin.register(MedicalSession)
class MedicalSessionAdmin(admin.ModelAdmin):

    list_display = (
        'id',
        'user',
        'token',
        'created_at',
        'expires_at',
        'session_status',
    )

    list_filter = (
        'created_at',
        'expires_at',
    )

    search_fields = (
        'user__username',
        'user__name',
        'token',
    )

    readonly_fields = (
        'created_at',
    )

    ordering = (
        '-created_at',
    )

    def session_status(self, obj):
        if obj.is_expired():
            return 'Expired'

        return 'Active'

    session_status.short_description = 'Status'