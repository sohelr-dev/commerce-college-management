<?php

use App\Http\Controllers\Api\AttendanceController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BannerController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\DepartmentController;
use App\Http\Controllers\Api\EventController;
use App\Http\Controllers\Api\ExamController;
use App\Http\Controllers\Api\ExamResultController;
use App\Http\Controllers\Api\ExamRoutineController;
use App\Http\Controllers\Api\FeeController;
use App\Http\Controllers\Api\GalleryController;
use App\Http\Controllers\Api\GradeScaleController;
use App\Http\Controllers\Api\HomepageSectionController;
use App\Http\Controllers\Api\LibraryController;
use App\Http\Controllers\Api\NoticeController;
use App\Http\Controllers\Api\PayrollController;
use App\Http\Controllers\Api\PublicController;
use App\Http\Controllers\Api\SectionController;
use App\Http\Controllers\Api\SemesterController;
use App\Http\Controllers\Api\SiteSettingController;
use App\Http\Controllers\Api\SubjectController;
use App\Http\Controllers\Api\SubjectSelectionController;
use App\Http\Controllers\Api\TabulationController;
use App\Http\Controllers\Api\TransportController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;

// ===== PUBLIC WEBSITE (no auth) =====
Route::prefix('public')->group(function () {
    Route::get('/settings', [PublicController::class, 'settings']);
    Route::get('/stats', [PublicController::class, 'stats']);
    Route::get('/banners', [PublicController::class, 'banners']);
    Route::get('/gallery', [PublicController::class, 'gallery']);
    Route::get('/events', [PublicController::class, 'events']);
    Route::get('/sections', [PublicController::class, 'sections']);
    Route::get('/departments', [PublicController::class, 'departments']);
    Route::get('/notices', [PublicController::class, 'notices']);
    Route::get('/faculty', [PublicController::class, 'faculty']);
    Route::post('/contact', [PublicController::class, 'storeContact']);
});

// Public auth
Route::post('/login', [AuthController::class, 'login']);

// Authenticated (any role)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::put('/me/password', [AuthController::class, 'updatePassword']);
    Route::get('/dashboard', [DashboardController::class, 'index']);
    Route::get('/notices', [NoticeController::class, 'index']);

    // Departments / Semesters / Sections / Subjects - read-only for all authenticated users
    Route::get('/departments', [DepartmentController::class, 'index']);
    Route::get('/departments/{department}', [DepartmentController::class, 'show']);
    Route::get('/semesters', [SemesterController::class, 'index']);
    Route::get('/semesters/{semester}', [SemesterController::class, 'show']);
    Route::get('/sections', [SectionController::class, 'index']);
    Route::get('/sections/{section}', [SectionController::class, 'show']);
    Route::get('/subjects', [SubjectController::class, 'index']);
    Route::get('/subjects/{subject}', [SubjectController::class, 'show']);
    Route::get('/subject-selection-groups', [SubjectSelectionController::class, 'index']);
    Route::get('/subject-selection-options', [SubjectSelectionController::class, 'optionsFor']);

    // Teacher subjects list (read — authenticated হলেই দেখা যাবে)
    Route::get('/subjects/teacher-subjects', [SubjectController::class, 'teacherSubjects']);

    // Library - read-only list for everyone, own issues for everyone
    Route::get('/library/books', [LibraryController::class, 'index']);
    Route::get('/library/my-issues', [LibraryController::class, 'myIssues']);

    // Transport - read-only list for everyone
    Route::get('/transport/routes', [TransportController::class, 'routes']);
    Route::get('/transport/vehicles', [TransportController::class, 'vehicles']);

    // ===== ADMIN ONLY =====
    Route::middleware('role:admin')->group(function () {
        Route::apiResource('departments', DepartmentController::class)->except(['index', 'show']);
        Route::apiResource('semesters', SemesterController::class)->except(['index', 'show']);
        Route::apiResource('sections', SectionController::class)->except(['index', 'show']);
        Route::apiResource('subjects', SubjectController::class)->except(['index', 'show']);

        // Subject ↔ Teacher assignment (admin only)
        Route::post('/subjects/{subject}/assign-teacher',   [SubjectController::class, 'assignTeacher']);
        Route::post('/subjects/{subject}/unassign-teacher', [SubjectController::class, 'unassignTeacher']);

        Route::apiResource('grade-scales', GradeScaleController::class);
        Route::post('/subject-selection-groups', [SubjectSelectionController::class, 'store']);
        Route::delete('/subject-selection-groups/{subjectSelectionGroup}', [SubjectSelectionController::class, 'destroy']);

        Route::apiResource('users', UserController::class);
        Route::put('/users/{user}/reset-password', [UserController::class, 'resetPassword']);

        // Student session list (unique sessions — for filter dropdown)
        Route::get('/students/sessions', [UserController::class, 'studentSessions']);

        // Bulk year promotion: 1st year → 2nd year (session change হয় না)
        Route::post('/students/bulk-promote-year', [UserController::class, 'bulkPromoteYear']);

        // CMS Resources
        Route::apiResource('banners', BannerController::class);
        Route::apiResource('gallery', GalleryController::class);
        Route::apiResource('events', EventController::class);
        Route::get('/homepage-sections', [HomepageSectionController::class, 'index']);
        Route::put('/homepage-sections', [HomepageSectionController::class, 'update']);

        Route::post('/exams', [ExamController::class, 'store']);
        Route::put('/exams/{exam}', [ExamController::class, 'update']);
        Route::delete('/exams/{exam}', [ExamController::class, 'destroy']);
        Route::post('/exam-routines', [ExamRoutineController::class, 'store']);
        Route::delete('/exam-routines/{examRoutine}', [ExamRoutineController::class, 'destroy']);
        Route::get('/exams/{exam}/tabulation', [TabulationController::class, 'index']);
        Route::get('/students/{studentId}/results', [ExamResultController::class, 'studentResults']);

        Route::post('/fees', [FeeController::class, 'store']);
        Route::delete('/fees/{fee}', [FeeController::class, 'destroy']);
        Route::post('/fees/collect-payment', [FeeController::class, 'collectPayment']);
        Route::get('/fees/report', [FeeController::class, 'report']);
        Route::get('/fees/monthly-report', [FeeController::class, 'monthlyReport']);
        Route::get('/fees/student-summary', [FeeController::class, 'studentFeesSummary']);

        Route::get('/attendance/report', [AttendanceController::class, 'report']);

        Route::post('/notices', [NoticeController::class, 'store']);
        Route::put('/notices/{notice}', [NoticeController::class, 'update']);
        Route::delete('/notices/{notice}', [NoticeController::class, 'destroy']);

        // ===== Library =====
        Route::post('/library/books', [LibraryController::class, 'store']);
        Route::put('/library/books/{book}', [LibraryController::class, 'update']);
        Route::delete('/library/books/{book}', [LibraryController::class, 'destroy']);
        Route::post('/library/issue', [LibraryController::class, 'issue']);
        Route::post('/library/issues/{bookIssue}/return', [LibraryController::class, 'returnBook']);
        Route::get('/library/issues', [LibraryController::class, 'allIssues']);

        // ===== Transport =====
        Route::post('/transport/routes', [TransportController::class, 'storeRoute']);
        Route::delete('/transport/routes/{route}', [TransportController::class, 'destroyRoute']);
        Route::post('/transport/vehicles', [TransportController::class, 'storeVehicle']);
        Route::delete('/transport/vehicles/{vehicle}', [TransportController::class, 'destroyVehicle']);
        Route::get('/transport/assignments', [TransportController::class, 'assignments']);
        Route::post('/transport/assign', [TransportController::class, 'assignStudent']);
        Route::delete('/transport/assignments/{studentTransport}', [TransportController::class, 'removeAssignment']);

        // ===== Payroll =====
        Route::get('/payroll/structures', [PayrollController::class, 'structures']);
        Route::post('/payroll/structures', [PayrollController::class, 'storeStructure']);
        Route::post('/payroll/generate', [PayrollController::class, 'generateMonthly']);
        Route::put('/payroll/payments/{salaryPayment}/mark-paid', [PayrollController::class, 'markPaid']);
        Route::get('/payroll/report', [PayrollController::class, 'report']);

        // ===== Website / Site Settings =====
        Route::get('/settings', [SiteSettingController::class, 'show']);
        Route::put('/settings', [SiteSettingController::class, 'update']);
        Route::get('/contact-messages', [SiteSettingController::class, 'contactMessages']);
        Route::put('/contact-messages/{contactMessage}/read', [SiteSettingController::class, 'markContactRead']);
        Route::delete('/contact-messages/{contactMessage}', [SiteSettingController::class, 'destroyContact']);
    });

    // ===== ADMIN + TEACHER =====
    Route::middleware('role:admin,teacher')->group(function () {
        Route::get('/exams', [ExamController::class, 'index']);
        Route::get('/exams/{exam}', [ExamController::class, 'show']);
        Route::get('/fees', [FeeController::class, 'index']);

        Route::get('/attendance/students', [AttendanceController::class, 'studentsFor']);
        Route::post('/attendance/bulk', [AttendanceController::class, 'bulkStore']);

        // Result entry workflow (step by step):
        // 1. GET /exam-result/filter-options         → available session & year list পাও
        // 2. GET /exams?department_id=X&session=Y&year=Z  → filtered exam list পাও
        // 3. GET /exams/{exam}/results/students?section_id=X&subject_id=Y → student list পাও
        // 4. POST /exams/{exam}/results/bulk          → marks save করো
        Route::get('/exam-result/filter-options', [ExamResultController::class, 'examFilterOptions']);
        Route::get('/my/sections-with-subjects', [ExamResultController::class, 'teacherSectionsWithSubjects']);
        Route::get('/exams/{exam}/results/students', [ExamResultController::class, 'studentsFor']);
        Route::post('/exams/{exam}/results/bulk', [ExamResultController::class, 'bulkStore']);
        Route::get('/exam-routines', [ExamRoutineController::class, 'index']);
    });

    // ===== TEACHER can also post limited notices =====
    Route::middleware('role:teacher')->group(function () {
        Route::post('/notices/teacher', [NoticeController::class, 'store']);
        Route::get('/my/payroll', [PayrollController::class, 'myPayroll']);
    });

    // ===== STUDENT ONLY =====
    Route::middleware('role:student')->group(function () {
        Route::get('/my/attendance', [AttendanceController::class, 'myAttendance']);
        Route::get('/my/results', [ExamResultController::class, 'myResults']);
        Route::get('/my/fees', [FeeController::class, 'myFees']);
        Route::get('/my/transport', [TransportController::class, 'myTransport']);
        Route::get('/my/routine', [ExamRoutineController::class, 'myRoutine']);
    });
});
