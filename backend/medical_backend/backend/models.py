from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone
import re
import random


class Staff(AbstractUser):
    """
    Custom user/staff model for laboratory employees.
    """

    ROLES = [
        ("Admin", "Administrator"),
        ("Lab Technician", "Laboratory Technician"),
        ("Lab Assistant", "Laboratory Assistant"),
    ]

    id = models.CharField(
        max_length=10,
        primary_key=True
    )

    name = models.CharField(
        max_length=100
    )

    role = models.CharField(
        max_length=20,
        choices=ROLES
    )

    designation = models.CharField(
        max_length=100,
        blank=True
    )

    def __str__(self):
        return f"{self.name} ({self.role})"


class LabTest(models.Model):
    """
    Laboratory tests available in the system.
    """

    id = models.AutoField(
        primary_key=True
    )

    code = models.CharField(
        max_length=20,
        unique=True
    )

    name = models.CharField(
        max_length=200
    )

    category = models.CharField(
        max_length=100
    )

    turnaroundTime = models.CharField(
        max_length=50
    )

    sampleType = models.CharField(
        max_length=100
    )

    description = models.TextField()

    parameters = models.JSONField(
        default=list,
        blank=True
    )

    def __str__(self):
        return f"{self.code} - {self.name}"

    @classmethod
    def get_categories(cls):
        return list(
            cls.objects
            .values_list("category", flat=True)
            .distinct()
        )

    @classmethod
    def get_default_parameters(cls, test_code, gender=""):
        test = cls.objects.filter(
            code=test_code
        ).first()

        if not test:
            return []

        default_params = []

        for param in test.parameters:
            param_obj = param.copy()

            if (
                gender == "Male"
                and "normalRangeMale" in param_obj
            ):
                param_obj["normalRange"] = param_obj[
                    "normalRangeMale"
                ]

            elif (
                gender == "Female"
                and "normalRangeFemale" in param_obj
            ):
                param_obj["normalRange"] = param_obj[
                    "normalRangeFemale"
                ]

            default_params.append({
                "name": param_obj.get("name", ""),
                "value": "",
                "unit": param_obj.get("unit", ""),
                "normalRange": param_obj.get(
                    "normalRange", ""
                ),
                "flag": "",
            })

        return default_params

    @classmethod
    def create_seed_data(cls):
        """
        Creates default laboratory tests.

        This method is intentionally NOT called from save().
        Calling it from save() would cause recursive saves.
        """

        if cls.objects.exists():
            return

        seed_data = [
            {
                "code": "CBC",
                "name": "Complete Blood Count",
                "category": "Hematology",
                "turnaroundTime": "2 hours",
                "sampleType": "Whole Blood (EDTA)",
                "description": (
                    "Comprehensive automated 5-part differential "
                    "analysis of red cells, white cells, "
                    "hemoglobin, and platelets."
                ),
                "parameters": [
                    {
                        "name": "Hemoglobin",
                        "unit": "g/dL",
                        "normalRange": "13.5 – 17.5",
                        "normalRangeMale": "13.5 – 17.5",
                        "normalRangeFemale": "12.0 – 15.5",
                        "type": "numeric",
                    },
                    {
                        "name": "WBC",
                        "unit": "x10³/μL",
                        "normalRange": "4.5 – 11.0",
                        "type": "numeric",
                    },
                    {
                        "name": "RBC",
                        "unit": "x10⁶/μL",
                        "normalRange": "4.5 – 5.9",
                        "normalRangeMale": "4.5 – 5.9",
                        "normalRangeFemale": "4.1 – 5.1",
                        "type": "numeric",
                    },
                    {
                        "name": "Platelets",
                        "unit": "x10³/μL",
                        "normalRange": "150 – 400",
                        "type": "numeric",
                    },
                    {
                        "name": "Hematocrit",
                        "unit": "%",
                        "normalRange": "41 – 53",
                        "normalRangeMale": "41 – 53",
                        "normalRangeFemale": "36 – 46",
                        "type": "numeric",
                    },
                    {
                        "name": "MCV",
                        "unit": "fL",
                        "normalRange": "80 – 100",
                        "type": "numeric",
                    },
                    {
                        "name": "MCH",
                        "unit": "pg",
                        "normalRange": "27 – 33",
                        "type": "numeric",
                    },
                    {
                        "name": "MCHC",
                        "unit": "g/dL",
                        "normalRange": "32 – 36",
                        "type": "numeric",
                    },
                    {
                        "name": "Neutrophils",
                        "unit": "%",
                        "normalRange": "50 – 70",
                        "type": "numeric",
                    },
                    {
                        "name": "Lymphocytes",
                        "unit": "%",
                        "normalRange": "20 – 40",
                        "type": "numeric",
                    },
                    {
                        "name": "Monocytes",
                        "unit": "%",
                        "normalRange": "2 – 8",
                        "type": "numeric",
                    },
                    {
                        "name": "Eosinophils",
                        "unit": "%",
                        "normalRange": "1 – 4",
                        "type": "numeric",
                    },
                    {
                        "name": "Basophils",
                        "unit": "%",
                        "normalRange": "0 – 1",
                        "type": "numeric",
                    },
                ],
            },

            {
                "code": "BG-F",
                "name": "Blood Glucose (Fasting)",
                "category": "Clinical Chemistry",
                "turnaroundTime": "1 hour",
                "sampleType": "Sodium Fluoride Plasma",
                "description": (
                    "Fasting blood sugar assay for screening "
                    "and monitoring of diabetes mellitus."
                ),
                "parameters": [
                    {
                        "name": "Fasting Blood Glucose",
                        "unit": "mg/dL",
                        "normalRange": "70 – 100",
                        "type": "numeric",
                    }
                ],
            },

            {
                "code": "BG-R",
                "name": "Blood Glucose (Random)",
                "category": "Clinical Chemistry",
                "turnaroundTime": "1 hour",
                "sampleType": "Serum / Plasma",
                "description": (
                    "Immediate quantitative measurement "
                    "of plasma glucose levels."
                ),
                "parameters": [
                    {
                        "name": "Random Blood Glucose",
                        "unit": "mg/dL",
                        "normalRange": "< 140",
                        "type": "numeric",
                    }
                ],
            },

            {
                "code": "LP",
                "name": "Lipid Profile",
                "category": "Clinical Chemistry",
                "turnaroundTime": "2 hours",
                "sampleType": "Serum (Fasting 12h)",
                "description": (
                    "Quantitative measurement of total cholesterol, "
                    "HDL, LDL, and triglycerides."
                ),
                "parameters": [
                    {
                        "name": "Total Cholesterol",
                        "unit": "mg/dL",
                        "normalRange": "< 200",
                        "type": "numeric",
                    },
                    {
                        "name": "LDL Cholesterol",
                        "unit": "mg/dL",
                        "normalRange": "< 130",
                        "type": "numeric",
                    },
                    {
                        "name": "HDL Cholesterol",
                        "unit": "mg/dL",
                        "normalRange": "> 40",
                        "normalRangeMale": "> 40",
                        "normalRangeFemale": "> 50",
                        "type": "numeric",
                    },
                    {
                        "name": "Triglycerides",
                        "unit": "mg/dL",
                        "normalRange": "< 150",
                        "type": "numeric",
                    },
                    {
                        "name": "VLDL",
                        "unit": "mg/dL",
                        "normalRange": "2 – 30",
                        "type": "numeric",
                    },
                ],
            },

            {
                "code": "LFT",
                "name": "Liver Function Tests",
                "category": "Clinical Chemistry",
                "turnaroundTime": "3 hours",
                "sampleType": "Serum",
                "description": (
                    "Evaluation of hepatic enzymes, bilirubin, "
                    "total protein, and albumin."
                ),
                "parameters": [
                    {
                        "name": "ALT (SGPT)",
                        "unit": "U/L",
                        "normalRange": "7 – 56",
                        "type": "numeric",
                    },
                    {
                        "name": "AST (SGOT)",
                        "unit": "U/L",
                        "normalRange": "10 – 40",
                        "type": "numeric",
                    },
                    {
                        "name": "Alkaline Phosphatase",
                        "unit": "U/L",
                        "normalRange": "44 – 147",
                        "type": "numeric",
                    },
                    {
                        "name": "Total Bilirubin",
                        "unit": "mg/dL",
                        "normalRange": "0.2 – 1.2",
                        "type": "numeric",
                    },
                    {
                        "name": "Direct Bilirubin",
                        "unit": "mg/dL",
                        "normalRange": "0.0 – 0.3",
                        "type": "numeric",
                    },
                    {
                        "name": "Indirect Bilirubin",
                        "unit": "mg/dL",
                        "normalRange": "0.1 – 0.8",
                        "type": "numeric",
                    },
                    {
                        "name": "Total Protein",
                        "unit": "g/dL",
                        "normalRange": "6.0 – 8.3",
                        "type": "numeric",
                    },
                    {
                        "name": "Albumin",
                        "unit": "g/dL",
                        "normalRange": "3.5 – 5.0",
                        "type": "numeric",
                    },
                    {
                        "name": "Globulin",
                        "unit": "g/dL",
                        "normalRange": "2.0 – 3.5",
                        "type": "numeric",
                    },
                ],
            },

            {
                "code": "KFT",
                "name": "Kidney Function Tests",
                "category": "Clinical Chemistry",
                "turnaroundTime": "3 hours",
                "sampleType": "Serum",
                "description": (
                    "Evaluation of renal function including "
                    "creatinine, BUN, electrolytes, and eGFR."
                ),
                "parameters": [
                    {
                        "name": "Creatinine",
                        "unit": "mg/dL",
                        "normalRange": "0.7 – 1.3",
                        "normalRangeMale": "0.7 – 1.3",
                        "normalRangeFemale": "0.6 – 1.1",
                        "type": "numeric",
                    },
                    {
                        "name": "Blood Urea Nitrogen (BUN)",
                        "unit": "mg/dL",
                        "normalRange": "7 – 20",
                        "type": "numeric",
                    },
                    {
                        "name": "Uric Acid",
                        "unit": "mg/dL",
                        "normalRange": "3.4 – 7.0",
                        "normalRangeMale": "3.4 – 7.0",
                        "normalRangeFemale": "2.4 – 6.0",
                        "type": "numeric",
                    },
                    {
                        "name": "eGFR",
                        "unit": "mL/min/1.73m²",
                        "normalRange": "> 60",
                        "type": "numeric",
                    },
                    {
                        "name": "Sodium (Na)",
                        "unit": "mEq/L",
                        "normalRange": "136 – 145",
                        "type": "numeric",
                    },
                    {
                        "name": "Potassium (K)",
                        "unit": "mEq/L",
                        "normalRange": "3.5 – 5.0",
                        "type": "numeric",
                    },
                    {
                        "name": "Chloride (Cl)",
                        "unit": "mEq/L",
                        "normalRange": "98 – 106",
                        "type": "numeric",
                    },
                ],
            },

            {
                "code": "TFT",
                "name": "Thyroid Function Tests",
                "category": "Endocrinology",
                "turnaroundTime": "4 hours",
                "sampleType": "Serum",
                "description": (
                    "Quantitative measurement of TSH, free T4, "
                    "and free T3."
                ),
                "parameters": [
                    {
                        "name": "TSH",
                        "unit": "mIU/L",
                        "normalRange": "0.4 – 4.0",
                        "type": "numeric",
                    },
                    {
                        "name": "Free T4 (fT4)",
                        "unit": "ng/dL",
                        "normalRange": "0.8 – 1.8",
                        "type": "numeric",
                    },
                    {
                        "name": "Free T3 (fT3)",
                        "unit": "pg/mL",
                        "normalRange": "2.3 – 4.2",
                        "type": "numeric",
                    },
                ],
            },

            {
                "code": "UA",
                "name": "Urinalysis",
                "category": "Urinalysis",
                "turnaroundTime": "1 hour",
                "sampleType": "Midstream Urine",
                "description": (
                    "Complete physical, chemical strip, "
                    "and microscopic urine evaluation."
                ),
                "parameters": [
                    {
                        "name": "Color",
                        "unit": "",
                        "normalRange": "Yellow",
                        "type": "text",
                    },
                    {
                        "name": "Clarity",
                        "unit": "",
                        "normalRange": "Clear",
                        "type": "text",
                    },
                    {
                        "name": "pH",
                        "unit": "",
                        "normalRange": "4.5 – 8.0",
                        "type": "numeric",
                    },
                    {
                        "name": "Specific Gravity",
                        "unit": "",
                        "normalRange": "1.001 – 1.035",
                        "type": "numeric",
                    },
                    {
                        "name": "Protein",
                        "unit": "",
                        "normalRange": "Negative",
                        "type": "qualitative",
                    },
                    {
                        "name": "Glucose",
                        "unit": "",
                        "normalRange": "Negative",
                        "type": "qualitative",
                    },
                    {
                        "name": "Ketones",
                        "unit": "",
                        "normalRange": "Negative",
                        "type": "qualitative",
                    },
                    {
                        "name": "Blood",
                        "unit": "",
                        "normalRange": "Negative",
                        "type": "qualitative",
                    },
                    {
                        "name": "Nitrites",
                        "unit": "",
                        "normalRange": "Negative",
                        "type": "qualitative",
                    },
                    {
                        "name": "Leukocyte Esterase",
                        "unit": "",
                        "normalRange": "Negative",
                        "type": "qualitative",
                    },
                    {
                        "name": "Urobilinogen",
                        "unit": "mg/dL",
                        "normalRange": "0.2 – 1.0",
                        "type": "numeric",
                    },
                    {
                        "name": "WBC (Microscopy)",
                        "unit": "/HPF",
                        "normalRange": "0 – 5",
                        "type": "numeric",
                    },
                    {
                        "name": "RBC (Microscopy)",
                        "unit": "/HPF",
                        "normalRange": "0 – 2",
                        "type": "numeric",
                    },
                ],
            },

            {
                "code": "MAL",
                "name": "Malaria RDT",
                "category": "Parasitology",
                "turnaroundTime": "30 minutes",
                "sampleType": "Whole Blood",
                "description": (
                    "Rapid immunochromatographic antigen detection "
                    "for Plasmodium species."
                ),
                "parameters": [
                    {
                        "name": "P. falciparum Antigen",
                        "unit": "",
                        "normalRange": "Non-Reactive",
                        "type": "qualitative",
                    },
                    {
                        "name": "P. vivax Antigen",
                        "unit": "",
                        "normalRange": "Non-Reactive",
                        "type": "qualitative",
                    },
                ],
            },

            {
                "code": "WID",
                "name": "Widal Test",
                "category": "Serology",
                "turnaroundTime": "2 hours",
                "sampleType": "Serum",
                "description": (
                    "Agglutination test for detection of "
                    "Salmonella antibodies."
                ),
                "parameters": [
                    {
                        "name": "S. typhi O",
                        "unit": "titre",
                        "normalRange": "< 1:80",
                        "type": "text",
                    },
                    {
                        "name": "S. typhi H",
                        "unit": "titre",
                        "normalRange": "< 1:80",
                        "type": "text",
                    },
                    {
                        "name": "S. paratyphi AO",
                        "unit": "titre",
                        "normalRange": "< 1:80",
                        "type": "text",
                    },
                    {
                        "name": "S. paratyphi AH",
                        "unit": "titre",
                        "normalRange": "< 1:80",
                        "type": "text",
                    },
                ],
            },

            {
                "code": "HIV",
                "name": "HIV 1&2 Screening",
                "category": "Serology",
                "turnaroundTime": "1 hour",
                "sampleType": "Whole Blood / Serum",
                "description": (
                    "Qualitative rapid screening for antibodies "
                    "to Human Immunodeficiency Virus types 1 and 2."
                ),
                "parameters": [
                    {
                        "name": "HIV 1/2 Antibody",
                        "unit": "",
                        "normalRange": "Non-Reactive",
                        "type": "qualitative",
                    }
                ],
            },

            {
                "code": "HBsAg",
                "name": "Hepatitis B Surface Antigen",
                "category": "Serology",
                "turnaroundTime": "1 hour",
                "sampleType": "Serum",
                "description": (
                    "Qualitative immunoassay for Hepatitis B "
                    "surface antigen detection."
                ),
                "parameters": [
                    {
                        "name": "HBsAg",
                        "unit": "",
                        "normalRange": "Non-Reactive",
                        "type": "qualitative",
                    }
                ],
            },

            {
                "code": "HCV",
                "name": "Hepatitis C Antibody",
                "category": "Serology",
                "turnaroundTime": "1 hour",
                "sampleType": "Serum",
                "description": (
                    "Qualitative immunoassay screening for "
                    "Hepatitis C virus antibodies."
                ),
                "parameters": [
                    {
                        "name": "HCV Antibody",
                        "unit": "",
                        "normalRange": "Non-Reactive",
                        "type": "qualitative",
                    }
                ],
            },
        ]

        for test_data in seed_data:
            cls.objects.create(**test_data)


class Patient(models.Model):
    """
    Patient registered in the laboratory.
    """

    GENDER_CHOICES = [
        ("Male", "Male"),
        ("Female", "Female"),
        ("Other", "Other"),
    ]

    id = models.CharField(
        max_length=50,
        primary_key=True
    )

    patientId = models.CharField(
        max_length=20,
        unique=True
    )

    name = models.CharField(
        max_length=100
    )

    age = models.IntegerField()

    gender = models.CharField(
        max_length=10,
        choices=GENDER_CHOICES
    )

    contact = models.CharField(
        max_length=50
    )

    address = models.TextField()

    doctorName = models.CharField(
        max_length=100
    )

    doctorContact = models.CharField(
        max_length=50
    )

    referredFrom = models.CharField(
        max_length=200
    )

    status = models.CharField(
        max_length=20,
        default="Pending"
    )

    priority = models.CharField(
        max_length=10,
        default="Normal"
    )

    dateRegistered = models.DateTimeField(
        default=timezone.now
    )

    dateCompleted = models.DateTimeField(
        null=True,
        blank=True
    )

    notes = models.TextField(
        blank=True
    )

    createdBy = models.CharField(
        max_length=50
    )

    def save(self, *args, **kwargs):
        if not self.id:
            self.generate_id()

        if not self.patientId:
            self.generate_patient_id()

        super().save(*args, **kwargs)

    def generate_id(self):
        self.id = str(
            random.randint(
                1000000000,
                9999999999
            )
        )

    def generate_patient_id(self):
        year = timezone.now().year

        count = Patient.objects.filter(
            patientId__startswith=f"LCL-{year}-"
        ).count() + 1

        self.patientId = (
            f"LCL-{year}-{str(count).zfill(4)}"
        )

    def update_status(self):
        total_tests = self.tests.count()

        completed = self.tests.filter(
            status="Completed"
        ).count()

        in_progress = self.tests.filter(
            status__in=[
                "In Progress",
                "Completed"
            ]
        ).count()

        if total_tests == 0:
            self.status = "Pending"

        elif completed == total_tests:
            self.status = "Completed"
            self.dateCompleted = timezone.now()

        elif in_progress > 0:
            self.status = "In Progress"

        else:
            self.status = "Pending"

        self.save(
            update_fields=[
                "status",
                "dateCompleted"
            ]
        )

    def get_stats(self):
        today = timezone.now().date()

        return {
            "total": Patient.objects.count(),

            "pending": Patient.objects.filter(
                status="Pending"
            ).count(),

            "inProgress": Patient.objects.filter(
                status="In Progress"
            ).count(),

            "completed": Patient.objects.filter(
                status="Completed"
            ).count(),

            "todayCount": Patient.objects.filter(
                dateRegistered__date=today
            ).count(),

            "urgent": Patient.objects.filter(
                priority="Urgent"
            ).count(),
        }

    def get_all(self):
        return list(
            self.tests.all()
        )

    def __str__(self):
        return f"{self.name} ({self.patientId})"


class PatientTest(models.Model):
    """
    A laboratory test assigned to a patient.
    """

    id = models.CharField(
        max_length=50,
        primary_key=True
    )

    patient = models.ForeignKey(
        Patient,
        on_delete=models.CASCADE,
        related_name="tests"
    )

    testCode = models.CharField(
        max_length=20
    )

    testName = models.CharField(
        max_length=200
    )

    category = models.CharField(
        max_length=100
    )

    status = models.CharField(
        max_length=20,
        default="Pending"
    )

    completedAt = models.DateTimeField(
        null=True,
        blank=True
    )

    completedBy = models.CharField(
        max_length=50,
        null=True,
        blank=True
    )

    parameters = models.JSONField(
        default=list,
        blank=True
    )

    def save(self, *args, **kwargs):
        if not self.id:
            self.id = str(
                random.randint(
                    1000000000,
                    9999999999
                )
            )

        super().save(*args, **kwargs)

    def __str__(self):
        return (
            f"{self.patient.name} - "
            f"{self.testName}"
        )


class TestResultParameter(models.Model):
    """
    Individual result parameter belonging to a patient test.
    """

    id = models.AutoField(
        primary_key=True
    )

    test = models.ForeignKey(
        PatientTest,
        on_delete=models.CASCADE,
        related_name="result_parameters"
    )

    name = models.CharField(
        max_length=100
    )

    value = models.CharField(
        max_length=50
    )

    unit = models.CharField(
        max_length=50,
        blank=True
    )

    normalRange = models.CharField(
        max_length=100,
        blank=True
    )

    flag = models.CharField(
        max_length=20,
        default="",
        blank=True
    )

    @classmethod
    def calculate_flag(
        cls,
        value,
        normal_range
    ):
        if not value or not normal_range:
            return ""

        value = str(value).strip()
        normal_range = str(
            normal_range
        ).strip()

        try:
            num_value = float(value)

        except (ValueError, TypeError):

            lv = value.lower()
            lr = normal_range.lower()

            if (
                lr in (
                    "negative",
                    "non-reactive"
                )
                or "negative" in lr
                or "non-reactive" in lr
            ):

                if (
                    "positive" in lv
                    or "reactive" in lv
                ):
                    return "Positive"

                if (
                    "negative" in lv
                    or "non-reactive" in lv
                ):
                    return "Negative"

                return "Abnormal"

            if lv == lr:
                return "Normal"

            return "Abnormal"

        # Range such as:
        # 13.5 – 17.5
        # 4 - 10
        range_match = re.match(
            r"^\s*"
            r"(\d+(?:\.\d+)?)"
            r"\s*[–-]\s*"
            r"(\d+(?:\.\d+)?)"
            r"\s*$",
            normal_range
        )

        if range_match:

            min_value = float(
                range_match.group(1)
            )

            max_value = float(
                range_match.group(2)
            )

            if num_value < min_value:
                return "Low"

            if num_value > max_value:
                return "High"

            return "Normal"

        # Range such as:
        # > 60
        # >= 60
        gt_match = re.match(
            r"^\s*[>≥]\s*"
            r"(\d+(?:\.\d+)?)"
            r"\s*$",
            normal_range
        )

        if gt_match:

            min_value = float(
                gt_match.group(1)
            )

            if num_value < min_value:
                return "Low"

            return "Normal"

        # Range such as:
        # < 200
        # <= 200
        lt_match = re.match(
            r"^\s*[<≤]\s*"
            r"(\d+(?:\.\d+)?)"
            r"\s*$",
            normal_range
        )

        if lt_match:

            max_value = float(
                lt_match.group(1)
            )

            if num_value > max_value:
                return "High"

            return "Normal"

        return "Normal"


class MedicalSession(models.Model):
    """
    Session information associated with a staff user.
    """

    user = models.ForeignKey(
        Staff,
        on_delete=models.CASCADE,
        related_name="medical_sessions"
    )

    token = models.CharField(
        max_length=255,
        unique=True
    )

    created_at = models.DateTimeField(
        default=timezone.now
    )

    expires_at = models.DateTimeField()

    def is_expired(self):
        return timezone.now() > self.expires_at

    def __str__(self):
        return (
            f"Session for "
            f"{self.user.username}"
        )