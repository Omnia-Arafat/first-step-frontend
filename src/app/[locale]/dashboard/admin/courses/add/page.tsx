import CourseForm from "@/components/dashboard/courses/CourseForm";

export const metadata = {
  title: "إضافة دورة جديدة | لوحة التحكم",
  description: "إنشاء دورة تربوية جديدة",
};

const AddCoursePage = () => {
  return <CourseForm />;
};

export default AddCoursePage;
