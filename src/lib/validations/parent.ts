import { z } from "zod";

export const createSignUpParentSchema = (locale: "ar" | "en") => {
  return z.object({
    // Parent Information
    name: z.string().min(1, "Name is required"),
    phone: z
      .string()
      .regex(/^(009665|9665|\+9665|05|5)(5|0|3|6|4|9|1|8|7)([0-9]{7})$/, {
        message: "Please enter a valid phone number",
      }),
    email: z.string().email("Invalid email address"),
    address: z.string().optional(),
    kinship: z.string().min(1, "Kinship is required"),

    // Child Information
    childName: z.string().min(1, "Child name is required"),
    birthDate: z.date({
      required_error: "Birth date is required",
    }),
    fatherName: z.string().min(1, "Father's name is required"),
    motherName: z.string().min(1, "Mother's name is required"),
    gender: z.enum(["male", "female"], {
      required_error: "Gender is required",
    }),

    // Chronic Diseases
    chronicDiseases: z.object({
      hasDiseases: z.enum(["yes", "no"]),
      diseases: z.array(
        z.object({
          name: z.string().min(1, "Disease name is required"),
          medication: z.string().min(1, "Medication is required"),
          procedures: z.string().min(1, "Procedures are required"),
        })
      ),
    }),

    // Allergies
    allergies: z.object({
      hasAllergies: z.enum(["yes", "no"]),
      allergies: z.array(
        z.object({
          allergyTypes: z.string().min(1, "Allergy type is required"),
          allergyFoods: z.string().min(1, "Allergy foods are required"),
          allergyProcedures: z
            .string()
            .min(1, "Allergy procedures are required"),
        })
      ),
    }),

    // Recommendations
    childDescription: z.string().min(1, "Child description is required"),
    favoriteThings: z.string().min(1, "Favorite things are required"),
    recommendations: z.string().optional(),

    // Authorized Persons
    authorizedPersons: z.array(
      z.object({
        name: z.string().min(1, "Authorized person name is required"),
        idNumber: z.string().min(1, "ID number is required"),
      })
    ),

    // Comments
    comments: z.string().optional(),
  });
};

export type SignUpParentFormData = z.infer<
  ReturnType<typeof createSignUpParentSchema>
>;
