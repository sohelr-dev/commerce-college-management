<?php

namespace Database\Seeders;

use App\Models\Department;
use App\Models\Section;
use App\Models\Semester;
use App\Models\Subject;
use App\Models\SubjectSelectionGroup;
use Illuminate\Database\Seeder;

class HscCurriculumSeeder extends Seeder
{
    public function run(): void
    {
        // ==========================================
        // ১. ব্যবসায় শিক্ষা শাখা (Business Studies)
        // ==========================================
        $bizDept = Department::firstOrCreate(
            ['code' => 'BUS'],
            [
                'name' => 'ব্যবসায় শিক্ষা',
                'description' => 'উচ্চমাধ্যমিক ব্যবসায় শিক্ষা শাখা',
            ]
        );

        $bizSem1 = Semester::firstOrCreate(
            ['department_id' => $bizDept->id, 'name' => 'একাদশ শ্রেণি (১ম বর্ষ)'],
            ['order' => 1]
        );
        $bizSem2 = Semester::firstOrCreate(
            ['department_id' => $bizDept->id, 'name' => 'দ্বাদশ শ্রেণি (২য় বর্ষ)'],
            ['order' => 2]
        );

        foreach ([$bizSem1, $bizSem2] as $sem) {
            Section::firstOrCreate(['semester_id' => $sem->id, 'name' => 'শাখা ক (Section A)'], ['capacity' => 80]);
            Section::firstOrCreate(['semester_id' => $sem->id, 'name' => 'শাখা খ (Section B)'], ['capacity' => 80]);

            // আবশ্যিক বিষয়
            $bBangla = Subject::updateOrCreate(
                ['department_id' => $bizDept->id, 'semester_id' => $sem->id, 'code' => '101-102'],
                [
                    'name' => 'বাংলা (১০১-১০২)',
                    'subject_category' => 'compulsory',
                    'grading_type' => 'general',
                    'full_marks' => 100,
                    'full_marks_mcq' => 30,
                    'full_marks_written' => 70,
                    'pass_marks_overall' => 33,
                    'pass_marks_mcq' => 10,
                    'pass_marks_written' => 23,
                    'require_overall_pass' => true,
                    'require_written_pass' => true,
                    'require_mcq_pass' => true,
                ]
            );

            $bEnglish = Subject::updateOrCreate(
                ['department_id' => $bizDept->id, 'semester_id' => $sem->id, 'code' => '107-108'],
                [
                    'name' => 'ইংরেজি (১০৭-১০৮)',
                    'subject_category' => 'compulsory',
                    'grading_type' => 'english',
                    'full_marks' => 100,
                    'full_marks_written' => 100,
                    'pass_marks_overall' => 33,
                    'pass_marks_written' => 33,
                    'require_overall_pass' => true,
                    'require_written_pass' => true,
                ]
            );

            $bIct = Subject::updateOrCreate(
                ['department_id' => $bizDept->id, 'semester_id' => $sem->id, 'code' => '275'],
                [
                    'name' => 'তথ্য ও যোগাযোগ প্রযুক্তি (ICT) (২৭৫)',
                    'subject_category' => 'compulsory',
                    'grading_type' => 'ict_home_science',
                    'full_marks' => 100,
                    'full_marks_written' => 50,
                    'full_marks_mcq' => 25,
                    'full_marks_practical' => 25,
                    'pass_marks_overall' => 33,
                    'pass_marks_written' => 17,
                    'pass_marks_mcq' => 8,
                    'pass_marks_practical' => 8,
                    'require_overall_pass' => true,
                    'require_written_pass' => true,
                    'require_mcq_pass' => true,
                    'require_practical_pass' => true,
                ]
            );

            // নির্বাচনিক ও ঐচ্ছিক বিষয়
            $bAcc = Subject::updateOrCreate(
                ['department_id' => $bizDept->id, 'semester_id' => $sem->id, 'code' => '253-254'],
                [
                    'name' => 'হিসাব বিজ্ঞান (২৫৩-২৫৪)',
                    'subject_category' => 'group_a',
                    'grading_type' => 'general',
                    'full_marks' => 100,
                    'full_marks_mcq' => 30,
                    'full_marks_written' => 70,
                    'pass_marks_overall' => 33,
                    'pass_marks_mcq' => 10,
                    'pass_marks_written' => 23,
                    'require_overall_pass' => true,
                    'require_written_pass' => true,
                    'require_mcq_pass' => true,
                ]
            );

            $bBom = Subject::updateOrCreate(
                ['department_id' => $bizDept->id, 'semester_id' => $sem->id, 'code' => '277-278'],
                [
                    'name' => 'ব্যবসায় সংগঠন ও ব্যবস্থাপনা (২৭৭-২৭৮)',
                    'subject_category' => 'group_a',
                    'grading_type' => 'general',
                    'full_marks' => 100,
                    'full_marks_mcq' => 30,
                    'full_marks_written' => 70,
                    'pass_marks_overall' => 33,
                    'pass_marks_mcq' => 10,
                    'pass_marks_written' => 23,
                    'require_overall_pass' => true,
                    'require_written_pass' => true,
                    'require_mcq_pass' => true,
                ]
            );

            $bFin = Subject::updateOrCreate(
                ['department_id' => $bizDept->id, 'semester_id' => $sem->id, 'code' => '292-293'],
                [
                    'name' => 'ফিন্যান্স, ব্যাংকিং ও বীমা (২৯২-২৯৩)',
                    'subject_category' => 'group_a',
                    'grading_type' => 'general',
                    'full_marks' => 100,
                    'full_marks_mcq' => 30,
                    'full_marks_written' => 70,
                    'pass_marks_overall' => 33,
                    'pass_marks_mcq' => 10,
                    'pass_marks_written' => 23,
                    'require_overall_pass' => true,
                    'require_written_pass' => true,
                    'require_mcq_pass' => true,
                ]
            );

            $bProd = Subject::updateOrCreate(
                ['department_id' => $bizDept->id, 'semester_id' => $sem->id, 'code' => '286-287'],
                [
                    'name' => 'উৎপাদন ব্যবস্থাপনা ও বিপণন (২৮৬-২৮৭)',
                    'subject_category' => 'group_a',
                    'grading_type' => 'general',
                    'full_marks' => 100,
                    'full_marks_mcq' => 30,
                    'full_marks_written' => 70,
                    'pass_marks_overall' => 33,
                    'pass_marks_mcq' => 10,
                    'pass_marks_written' => 23,
                    'require_overall_pass' => true,
                    'require_written_pass' => true,
                    'require_mcq_pass' => true,
                ]
            );

            $bHome = Subject::updateOrCreate(
                ['department_id' => $bizDept->id, 'semester_id' => $sem->id, 'code' => '273-274'],
                [
                    'name' => 'গার্হস্থ্য বিজ্ঞান (২৭৩-২৭৪) (শুধুমাত্র মেয়েদের জন্য)',
                    'subject_category' => 'group_b',
                    'grading_type' => 'ict_home_science',
                    'full_marks' => 100,
                    'full_marks_written' => 50,
                    'full_marks_mcq' => 25,
                    'full_marks_practical' => 25,
                    'pass_marks_overall' => 33,
                    'pass_marks_written' => 17,
                    'pass_marks_mcq' => 8,
                    'pass_marks_practical' => 8,
                    'require_overall_pass' => true,
                    'require_written_pass' => true,
                    'require_mcq_pass' => true,
                    'require_practical_pass' => true,
                ]
            );

            // ক - গুচ্ছ (নির্বাচনিক বিষয় - ৩টি নিতে হবে)
            $bizGroupA = SubjectSelectionGroup::updateOrCreate(
                ['department_id' => $bizDept->id, 'semester_id' => $sem->id, 'code' => 'group_a'],
                [
                    'name' => 'ক - গুচ্ছ (নির্বাচনিক বিষয়)',
                    'required_count' => 3,
                    'is_mandatory_pass' => true,
                ]
            );
            $bizGroupA->subjects()->sync([$bAcc->id, $bBom->id, $bFin->id, $bProd->id]);

            // খ - গুচ্ছ (ঐচ্ছিক / ফোর্থ সাবজেক্ট - ১টি নিতে হবে)
            $bizGroupB = SubjectSelectionGroup::updateOrCreate(
                ['department_id' => $bizDept->id, 'semester_id' => $sem->id, 'code' => 'group_b'],
                [
                    'name' => 'খ - গুচ্ছ (ঐচ্ছিক / ফোর্থ সাবজেক্ট)',
                    'required_count' => 1,
                    'is_mandatory_pass' => false,
                ]
            );
            $bizGroupB->subjects()->sync([$bFin->id, $bProd->id, $bHome->id]);
        }

        // ==========================================
        // ২. মানবিক শাখা (Humanities)
        // ==========================================
        $humDept = Department::firstOrCreate(
            ['code' => 'HUM'],
            [
                'name' => 'মানবিক',
                'description' => 'উচ্চমাধ্যমিক মানবিক শাখা',
            ]
        );

        $humSem1 = Semester::firstOrCreate(
            ['department_id' => $humDept->id, 'name' => 'একাদশ শ্রেণি (১ম বর্ষ)'],
            ['order' => 1]
        );
        $humSem2 = Semester::firstOrCreate(
            ['department_id' => $humDept->id, 'name' => 'দ্বাদশ শ্রেণি (২য় বর্ষ)'],
            ['order' => 2]
        );

        foreach ([$humSem1, $humSem2] as $sem) {
            Section::firstOrCreate(['semester_id' => $sem->id, 'name' => 'শাখা ক (Section A)'], ['capacity' => 80]);
            Section::firstOrCreate(['semester_id' => $sem->id, 'name' => 'শাখা খ (Section B)'], ['capacity' => 80]);

            // আবশ্যিক বিষয়
            $hBangla = Subject::updateOrCreate(
                ['department_id' => $humDept->id, 'semester_id' => $sem->id, 'code' => '101-102'],
                [
                    'name' => 'বাংলা (১০১-১০২)',
                    'subject_category' => 'compulsory',
                    'grading_type' => 'general',
                    'full_marks' => 100,
                    'full_marks_mcq' => 30,
                    'full_marks_written' => 70,
                    'pass_marks_overall' => 33,
                    'pass_marks_mcq' => 10,
                    'pass_marks_written' => 23,
                    'require_overall_pass' => true,
                    'require_written_pass' => true,
                    'require_mcq_pass' => true,
                ]
            );

            $hEnglish = Subject::updateOrCreate(
                ['department_id' => $humDept->id, 'semester_id' => $sem->id, 'code' => '107-108'],
                [
                    'name' => 'ইংরেজি (১০৭-১০৮)',
                    'subject_category' => 'compulsory',
                    'grading_type' => 'english',
                    'full_marks' => 100,
                    'full_marks_written' => 100,
                    'pass_marks_overall' => 33,
                    'pass_marks_written' => 33,
                    'require_overall_pass' => true,
                    'require_written_pass' => true,
                ]
            );

            $hIct = Subject::updateOrCreate(
                ['department_id' => $humDept->id, 'semester_id' => $sem->id, 'code' => '275'],
                [
                    'name' => 'তথ্য ও যোগাযোগ প্রযুক্তি (ICT) (২৭৫)',
                    'subject_category' => 'compulsory',
                    'grading_type' => 'ict_home_science',
                    'full_marks' => 100,
                    'full_marks_written' => 50,
                    'full_marks_mcq' => 25,
                    'full_marks_practical' => 25,
                    'pass_marks_overall' => 33,
                    'pass_marks_written' => 17,
                    'pass_marks_mcq' => 8,
                    'pass_marks_practical' => 8,
                    'require_overall_pass' => true,
                    'require_written_pass' => true,
                    'require_mcq_pass' => true,
                    'require_practical_pass' => true,
                ]
            );

            // ক-গুচ্ছ বিষয়
            $hCiv = Subject::updateOrCreate(
                ['department_id' => $humDept->id, 'semester_id' => $sem->id, 'code' => '269-270'],
                [
                    'name' => 'পৌরনীতি ও সুশাসন (২৬৯-২৭০)',
                    'subject_category' => 'group_a',
                    'grading_type' => 'general',
                    'full_marks' => 100,
                    'full_marks_mcq' => 30,
                    'full_marks_written' => 70,
                    'pass_marks_overall' => 33,
                    'pass_marks_mcq' => 10,
                    'pass_marks_written' => 23,
                    'require_overall_pass' => true,
                    'require_written_pass' => true,
                    'require_mcq_pass' => true,
                ]
            );

            $hHist = Subject::updateOrCreate(
                ['department_id' => $humDept->id, 'semester_id' => $sem->id, 'code' => '304-305'],
                [
                    'name' => 'ইতিহাস (৩০৪-৩০৫)',
                    'subject_category' => 'group_a',
                    'grading_type' => 'general',
                    'full_marks' => 100,
                    'full_marks_mcq' => 30,
                    'full_marks_written' => 70,
                    'pass_marks_overall' => 33,
                    'pass_marks_mcq' => 10,
                    'pass_marks_written' => 23,
                    'require_overall_pass' => true,
                    'require_written_pass' => true,
                    'require_mcq_pass' => true,
                ]
            );

            $hIslHist = Subject::updateOrCreate(
                ['department_id' => $humDept->id, 'semester_id' => $sem->id, 'code' => '267-268'],
                [
                    'name' => 'ইসলামের ইতিহাস ও সংস্কৃতি (২৬৭-২৬৮)',
                    'subject_category' => 'group_a',
                    'grading_type' => 'general',
                    'full_marks' => 100,
                    'full_marks_mcq' => 30,
                    'full_marks_written' => 70,
                    'pass_marks_overall' => 33,
                    'pass_marks_mcq' => 10,
                    'pass_marks_written' => 23,
                    'require_overall_pass' => true,
                    'require_written_pass' => true,
                    'require_mcq_pass' => true,
                ]
            );

            $hSocWork = Subject::updateOrCreate(
                ['department_id' => $humDept->id, 'semester_id' => $sem->id, 'code' => '271-272'],
                [
                    'name' => 'সমাজকর্ম (২৭১-২৭২)',
                    'subject_category' => 'group_a',
                    'grading_type' => 'general',
                    'full_marks' => 100,
                    'full_marks_mcq' => 30,
                    'full_marks_written' => 70,
                    'pass_marks_overall' => 33,
                    'pass_marks_mcq' => 10,
                    'pass_marks_written' => 23,
                    'require_overall_pass' => true,
                    'require_written_pass' => true,
                    'require_mcq_pass' => true,
                ]
            );

            // খ-গুচ্ছ বিষয়
            $hEcon = Subject::updateOrCreate(
                ['department_id' => $humDept->id, 'semester_id' => $sem->id, 'code' => '109-110'],
                [
                    'name' => 'অর্থনীতি (১০৯-১১০)',
                    'subject_category' => 'group_b',
                    'grading_type' => 'general',
                    'full_marks' => 100,
                    'full_marks_mcq' => 30,
                    'full_marks_written' => 70,
                    'pass_marks_overall' => 33,
                    'pass_marks_mcq' => 10,
                    'pass_marks_written' => 23,
                    'require_overall_pass' => true,
                    'require_written_pass' => true,
                    'require_mcq_pass' => true,
                ]
            );

            $hLogic = Subject::updateOrCreate(
                ['department_id' => $humDept->id, 'semester_id' => $sem->id, 'code' => '121-122'],
                [
                    'name' => 'যুক্তিবিদ্যা (১২১-১২২)',
                    'subject_category' => 'group_b',
                    'grading_type' => 'general',
                    'full_marks' => 100,
                    'full_marks_mcq' => 30,
                    'full_marks_written' => 70,
                    'pass_marks_overall' => 33,
                    'pass_marks_mcq' => 10,
                    'pass_marks_written' => 23,
                    'require_overall_pass' => true,
                    'require_written_pass' => true,
                    'require_mcq_pass' => true,
                ]
            );

            $hHome = Subject::updateOrCreate(
                ['department_id' => $humDept->id, 'semester_id' => $sem->id, 'code' => '273-274-H'],
                [
                    'name' => 'গার্হস্থ্য বিজ্ঞান (২৭৩-২৭৪) (শুধুমাত্র মেয়েদের জন্য)',
                    'subject_category' => 'group_b',
                    'grading_type' => 'ict_home_science',
                    'full_marks' => 100,
                    'full_marks_written' => 50,
                    'full_marks_mcq' => 25,
                    'full_marks_practical' => 25,
                    'pass_marks_overall' => 33,
                    'pass_marks_written' => 17,
                    'pass_marks_mcq' => 8,
                    'pass_marks_practical' => 8,
                    'require_overall_pass' => true,
                    'require_written_pass' => true,
                    'require_mcq_pass' => true,
                    'require_practical_pass' => true,
                ]
            );

            // ক - গুচ্ছ (নির্বাচনিক বিষয় - ৩টি নিতে হবে)
            $humGroupA = SubjectSelectionGroup::updateOrCreate(
                ['department_id' => $humDept->id, 'semester_id' => $sem->id, 'code' => 'group_a'],
                [
                    'name' => 'ক - গুচ্ছ (নির্বাচনিক বিষয়)',
                    'required_count' => 3,
                    'is_mandatory_pass' => true,
                ]
            );
            $humGroupA->subjects()->sync([$hCiv->id, $hHist->id, $hIslHist->id, $hSocWork->id]);

            // খ - গুচ্ছ (ঐচ্ছিক / ফোর্থ সাবজেক্ট - ১টি নিতে হবে)
            $humGroupB = SubjectSelectionGroup::updateOrCreate(
                ['department_id' => $humDept->id, 'semester_id' => $sem->id, 'code' => 'group_b'],
                [
                    'name' => 'খ - গুচ্ছ (ঐচ্ছিক / ফোর্থ সাবজেক্ট)',
                    'required_count' => 1,
                    'is_mandatory_pass' => false,
                ]
            );
            $humGroupB->subjects()->sync([$hEcon->id, $hLogic->id, $hSocWork->id, $hHome->id]);
        }
    }
}
