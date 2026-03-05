import { apiClient } from "./api";
import { formatTime } from "@/lib/utils";
import {
  BranchPricingData,
  CenterRegisterPayload,
  PortfolioFormData,
} from "@/types";
import { BranchAdminFormData } from "@/lib/schemas";
import { ApiErrorHandler } from "@/lib/error-handling";

const prepareCenterFormData = (
  formData: FormData,
  payload: CenterRegisterPayload | any,
) => {
  // Append text fields only if they exist
  if (payload.name) formData.append("name", payload.name);
  if (payload.email) formData.append("email", payload.email);
  if (payload.password) formData.append("password", payload.password);
  if (payload.phone) formData.append("phone", payload.phone);

  if (payload.additional_service) {
    formData.append("additional_service", payload.additional_service);
  }
  if (payload.work_days_from)
    formData.append("work_days_from", payload.work_days_from);
  if (payload.work_days_to)
    formData.append("work_days_to", payload.work_days_to);
  if (payload.work_hours_from)
    formData.append("work_hours_from", formatTime(payload.work_hours_from));
  if (payload.work_hours_to)
    formData.append("work_hours_to", formatTime(payload.work_hours_to));
  if (payload.time_of_first_period) {
    formData.append(
      "time_of_first_period",
      formatTime(payload.time_of_first_period),
    );
  }
  if (payload.time_of_second_period) {
    formData.append(
      "time_of_second_period",
      formatTime(payload.time_of_second_period),
    );
  }

  if (payload.emergency_contact !== undefined) {
    formData.append("emergency_contact", payload.emergency_contact ? "1" : "0");
  }
  if (payload.special_needs !== undefined) {
    formData.append("special_needs", payload.special_needs ? "1" : "0");
  }

  if (payload.nursery_name) {
    formData.append("nursery_name", payload.nursery_name);
  }
  if (payload.location) formData.append("location", payload.location);
  if (payload.city) formData.append("city_id", payload.city);
  if (payload.neighborhood)
    formData.append("neighborhood", payload.neighborhood);

  if (payload.provides_food !== undefined) {
    formData.append("provides_food", payload.provides_food ? "1" : "0");
  }

  // Append arrays only if they exist
  if (payload.nursery_type?.length) {
    payload.nursery_type.forEach((item: string) => {
      formData.append("nursery_type[]", item);
    });
  }
  if (payload.types?.length) {
    payload.types.forEach((item: string) => {
      formData.append("types[]", item);
    });
  }

  if (payload.communication_methods?.length) {
    payload.communication_methods.forEach((item: string) => {
      formData.append("communication_methods[]", item);
    });
  }

  if (payload.services?.length) {
    payload.services.forEach((item: string) => {
      formData.append("services[]", item);
    });
  }

  if (payload.accepted_ages?.length) {
    payload.accepted_ages.forEach((item: string) => {
      formData.append("accepted_ages[]", item);
    });
  }

  if (payload.first_meals?.length) {
    payload.first_meals.forEach((meal: any, index: number) => {
      if (meal.meal_name) {
        formData.append(`first_meals[${index}][meal_name]`, meal.meal_name);
      }
      if (meal.juice) {
        formData.append(`first_meals[${index}][juice]`, meal.juice);
      }
      if (meal.components) {
        formData.append(`first_meals[${index}][components]`, meal.components);
      }
    });
  }

  if (payload.second_meals?.length) {
    payload.second_meals.forEach((meal: any, index: number) => {
      if (meal.meal_name) {
        formData.append(`second_meals[${index}][meal_name]`, meal.meal_name);
      }
      if (meal.juice) {
        formData.append(`second_meals[${index}][juice]`, meal.juice);
      }
      if (meal.components) {
        formData.append(`second_meals[${index}][components]`, meal.components);
      }
    });
  }

  // Append files only if they exist
  if (payload.logo) formData.append("logo", payload.logo);
  if (payload.license_path)
    formData.append("license_path", payload.license_path);
  if (payload.commercial_record_path)
    formData.append("commercial_record_path", payload.commercial_record_path);
};

export const parentService = {
  getParentChildren: async () => {
    try {
      const response = await apiClient.get(`/children-all`);
      return response.data.data; // Return the actual children array from the response
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  getChild: async (id: string) => {
    try {
      // Use the direct endpoint to get a specific child with parent information
      const response = await apiClient.get(`/children-one/${id}`);
      return response.data.data; // Return the actual child object from the response
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  updateChild: async (id: string, payload: any) => {
    try {
      console.log("=== API updateChild DEBUGGING ===");
      console.log("Received payload:", payload);
      console.log("Payload allergies:", payload.allergies);
      console.log("Payload chronicDiseases:", payload.chronicDiseases);

      // Format the date to YYYY-MM-DD format
      const formattedDate =
        payload.birthDate instanceof Date
          ? payload.birthDate.toISOString().split("T")[0]
          : payload.birthDate;

      // Create FormData for file upload
      const formData = new FormData();

      // Add child data
      formData.append("child_name", payload.childName);
      formData.append("birthday_date", formattedDate);
      formData.append("gender", payload.gender === "male" ? "boy" : "girl");
      formData.append("national_number", payload.childNationalNumber || "");
      formData.append(
        "disease",
        payload.chronicDiseases.hasDiseases === "yes" ? "1" : "0",
      );
      formData.append(
        "allergy",
        payload.allergies.hasAllergies === "yes" ? "1" : "0",
      );
      formData.append("parent_name", payload.fatherName);
      formData.append("mother_name", payload.motherName);
      formData.append("recommendations", payload.recommendations || "");
      formData.append("description_3_words", payload.childDescription || "");
      formData.append("things_child_likes", payload.favoriteThings || "");
      formData.append("notes", payload.comments || "");
      formData.append("kinship", String(payload.kinship ?? ""));

      // Add image if present
      if (payload.childImage && payload.childImage instanceof File) {
        formData.append("image", payload.childImage);
      }

      // Add disease details - only send if there are actual diseases
      if (
        payload.chronicDiseases.hasDiseases === "yes" &&
        payload.chronicDiseases.diseases &&
        payload.chronicDiseases.diseases.length > 0
      ) {
        payload.chronicDiseases.diseases.forEach(
          (disease: any, index: number) => {
            // Only add if disease has a name
            if (disease.name && disease.name.trim() !== "") {
              formData.append(
                `disease_details[${index}][disease_name]`,
                disease.name,
              );
              formData.append(
                `disease_details[${index}][medicament]`,
                disease.medication || "",
              );
              formData.append(
                `disease_details[${index}][emergency]`,
                disease.procedures || "",
              );
              if (disease.id) {
                formData.append(`disease_details[${index}][id]`, disease.id);
              }
            }
          },
        );
      }

      // Add allergies - only send if there are actual allergies
      if (
        payload.allergies.hasAllergies === "yes" &&
        payload.allergies.allergies &&
        payload.allergies.allergies.length > 0
      ) {
        payload.allergies.allergies.forEach((allergy: any, index: number) => {
          // Only add if allergy has a name
          if (allergy.allergyTypes && allergy.allergyTypes.trim() !== "") {
            formData.append(`allergies[${index}][name]`, allergy.allergyTypes);
            formData.append(
              `allergies[${index}][allergy_causes]`,
              allergy.allergyFoods || "",
            );
            formData.append(
              `allergies[${index}][allergy_emergency]`,
              allergy.allergyProcedures || "",
            );
            if (allergy.id) {
              formData.append(`allergies[${index}][id]`, allergy.id);
            }
          }
        });
      }

      // Add authorized persons
      if (payload.authorizedPersons) {
        payload.authorizedPersons.forEach((person: any, index: number) => {
          formData.append(
            `authorized_people[${index}][name]`,
            person.name || "",
          );
          formData.append(
            `authorized_people[${index}][cin]`,
            person.idNumber || "",
          );
          if (person.id) {
            formData.append(`authorized_people[${index}][id]`, person.id);
          }
        });
      }

      console.log("Update FormData entries:");
      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }
      console.log("=== END API updateChild DEBUGGING ===");

      const response = await apiClient.post(`/v2/childs/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return response.data.data; // Return the actual data from the response
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  getDailyReports: async () => {
    try {
      const response = await apiClient.get(`/parent/daily-reports`);
      return response.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  deleteDailyReport: async (id: number) => {
    try {
      const response = await apiClient.delete(`/parent/daily-reports/${id}`);
      return response.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  addChild: async (payload: any) => {
    try {
      // Format the date to YYYY-MM-DD format
      const formattedDate =
        payload.birthDate instanceof Date
          ? payload.birthDate.toISOString().split("T")[0]
          : payload.birthDate;

      // Create FormData for file upload
      const formData = new FormData();

      // Add child data
      formData.append("children[0][child_name]", payload.childName);
      formData.append("children[0][birthday_date]", formattedDate);
      formData.append(
        "children[0][gender]",
        payload.gender === "male" ? "boy" : "girl",
      );
      formData.append(
        "children[0][national_number]",
        payload.childNationalNumber || "",
      );
      formData.append(
        "children[0][disease]",
        payload.chronicDiseases.hasDiseases === "yes" ? "1" : "0",
      );
      formData.append(
        "children[0][allergy]",
        payload.allergies.hasAllergies === "yes" ? "1" : "0",
      );
      formData.append("children[0][parent_name]", payload.fatherName);
      formData.append("children[0][mother_name]", payload.motherName);
      formData.append(
        "children[0][recommendations]",
        payload.recommendations || "",
      );
      formData.append(
        "children[0][description_3_words]",
        payload.childDescription || "",
      );
      formData.append(
        "children[0][things_child_likes]",
        payload.favoriteThings || "",
      );
      formData.append("children[0][notes]", payload.comments || "");
      formData.append("children[0][kinship]", String(payload.kinship ?? ""));

      // Add image if present
      if (payload.childImage && payload.childImage instanceof File) {
        formData.append("children[0][image]", payload.childImage);
      }

      // Add disease details - only send if there are actual diseases
      if (
        payload.chronicDiseases.hasDiseases === "yes" &&
        payload.chronicDiseases.diseases &&
        payload.chronicDiseases.diseases.length > 0
      ) {
        payload.chronicDiseases.diseases.forEach(
          (disease: any, index: number) => {
            // Only add if disease has a name
            if (disease.name && disease.name.trim() !== "") {
              formData.append(
                `children[0][disease_details][${index}][disease_name]`,
                disease.name,
              );
              formData.append(
                `children[0][disease_details][${index}][medicament]`,
                disease.medication || "",
              );
              formData.append(
                `children[0][disease_details][${index}][emergency]`,
                disease.procedures || "",
              );
            }
          },
        );
      }

      // Add allergies - only send if there are actual allergies
      if (
        payload.allergies.hasAllergies === "yes" &&
        payload.allergies.allergies &&
        payload.allergies.allergies.length > 0
      ) {
        payload.allergies.allergies.forEach((allergy: any, index: number) => {
          // Only add if allergy has a name
          if (allergy.allergyTypes && allergy.allergyTypes.trim() !== "") {
            formData.append(
              `children[0][allergies][${index}][name]`,
              allergy.allergyTypes,
            );
            formData.append(
              `children[0][allergies][${index}][allergy_causes]`,
              allergy.allergyFoods || "",
            );
            formData.append(
              `children[0][allergies][${index}][allergy_emergency]`,
              allergy.allergyProcedures || "",
            );
          }
        });
      }

      // Add authorized persons
      if (payload.authorizedPersons) {
        payload.authorizedPersons.forEach((person: any, index: number) => {
          formData.append(
            `children[0][authorized_persons][${index}][name]`,
            person.name || "",
          );
          formData.append(
            `children[0][authorized_persons][${index}][cin]`,
            person.idNumber || "",
          );
        });
      }

      console.log("FormData entries:");
      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }

      const response = await apiClient.post(`/v2/childs`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data.data; // Return the actual data from the response
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  getParentEnrollments: async (): Promise<EnrollmentsResponse> => {
    const authStorage = localStorage.getItem("auth-storage");
    let token = null;
    if (authStorage) {
      try {
        token = JSON.parse(authStorage).state.token;
      } catch (e) {
        console.error("Failed to parse auth-storage:", e);
      }
    }
    const response = await apiClient.get(`/parent/enrollments-get-all`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      withCredentials: true,
    });
    return response.data;
  },

  cancelEnrollment: async (id: number) => {
    try {
      const response = await apiClient.post(`/parent/enrollments/${id}/cancel`);
      return response.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  getUserData: async () => {
    try {
      const response = await apiClient.get(`/parent/get-user`);
      return response.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  updateProfile: async (payload: {
    email: string;
    phone: string;
    name: string;
    national_number: string;
  }) => {
    try {
      const response = await apiClient.put(
        `/parent/update-profile-parent`,
        payload,
      );
      return response.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  getChildrenCount: async () => {
    try {
      const response = await apiClient.get("/parent/count");
      return response.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  getEnrollmentsCount: async () => {
    try {
      const response = await apiClient.get("/parent/enrollments/count");
      return response.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  getUpcomingEnrollments: async () => {
    try {
      const response = await apiClient.get("/v2/enrollments/pending");
      return response.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  getCurrentEnrollments: async () => {
    try {
      const response = await apiClient.get("/v2/enrollments/accepted");
      return response.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },
};

export const centerService = {
  getBranches: async () => {
    try {
      const response = await apiClient.get("branches/");
      return response.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  getBranch: async (id: string) => {
    try {
      const response = await apiClient.get(`/branches/${id}`);
      return response.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  updateBranch: async (id: string, payload: CenterRegisterPayload) => {
    try {
      const formData = new FormData();
      prepareCenterFormData(formData, payload);

      const response = await apiClient.post(`/branches/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return response.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  createBranch: async (payload: CenterRegisterPayload | any) => {
    try {
      const formData = new FormData();
      prepareCenterFormData(formData, payload);

      const response = await apiClient.post("/branches", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  assignBranch: async (centerId: string, payload: BranchAdminFormData) => {
    try {
      const response = await apiClient.post(
        `/branches/${centerId}/assign-admin`,
        payload,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      return response.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  updateBranchAdmin: async (userId: string, payload: BranchAdminFormData) => {
    try {
      const response = await apiClient.post(
        `/branches/${userId}/update-admin`,
        payload,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      return response.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  deleteBranch: async (id: number) => {
    try {
      const response = await apiClient.delete(`/branches/${id}`);
      return response.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  getEnrollments: async () => {
    try {
      const response = await apiClient.get(`/enrollments/get-for-moblie`);
      return response.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  respondEnrollment: async (id: number, status: string) => {
    try {
      const response = await apiClient.patch(`/enrollments/${id}`, {
        status,
      });
      return response.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  respondExistingEnrollment: async (
    id: number,
    status: string,
    starting_date?: string,
    starting_time?: string,
    day_string?: string,
  ) => {
    try {
      const payload: any = { status };
      if (starting_date) payload.starting_date = starting_date;
      if (starting_time) payload.starting_time = starting_time;
      if (day_string) payload.day_string = day_string;

      const response = await apiClient.put(`/enrollments/${id}/paid`, payload);
      return response.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  sendExpiredNotification: async (id: number) => {
    try {
      const response = await apiClient.post(`/send-notification-expired/${id}`);
      return response.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  getChildrenFiles: async () => {
    try {
      const response = await apiClient.get(`/children`);
      return response.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  getChild: async (id: string) => {
    try {
      const response = await apiClient.get(`/children/${id}`);
      return response.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  getBranchTeam: async (id: string) => {
    try {
      const response = await apiClient.get(
        `/branch-team-members?branch_id=${id}`,
      );
      return response.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  getBranchTeamMember: async (id: string) => {
    try {
      const response = await apiClient.get(`/branch-team-members/${id}`);
      return response.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  createBranchTeamMember: async (payload: any) => {
    try {
      const response = await apiClient.post(`/branch-team-members`, payload, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  updateBranchTeamMember: async (id: string, payload: any) => {
    try {
      const response = await apiClient.post(
        `/branch-team-members/${id}`,
        payload,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );
      return response.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  deleteBranchTeamMember: async (id: string) => {
    try {
      const response = await apiClient.delete(`/branch-team-members/${id}`);
      return response.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  getDailyReports: async () => {
    try {
      const response = await apiClient.get(`/daily-reports`);
      return response.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  getDailyReport: async (id: string) => {
    try {
      const response = await apiClient.get(`/get-daily-report/${id}`);
      return response.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  sendDailyReport: async (childIds: string[], payload: any) => {
    try {
      const response = await apiClient.post(
        `/children/daily-reports`,
        {
          child_ids: childIds,
          ...payload,
        },
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );
      return response.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  getParents: async () => {
    try {
      const response = await apiClient.get(`/center/parents`);
      return response.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  getParent: async (id: string) => {
    try {
      const response = await apiClient.get(`/center/parent/${id}`);
      return response.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  getAds: async () => {
    try {
      const response = await apiClient.get(`/ads`);
      return response.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  requestAd: async (payload: {
    titleAr: string;
    titleEn: string;
    descriptionAr: string;
    descriptionEn: string;
    image: File;
    publish_date: string;
    end_date: string;
  }) => {
    try {
      const formData = new FormData();
      formData.append("title[ar]", payload.titleAr);
      formData.append("title[en]", payload.titleEn);
      formData.append("description[ar]", payload.descriptionAr);
      formData.append("description[en]", payload.descriptionEn);
      formData.append("image", payload.image);
      formData.append("publish_date", payload.publish_date);
      formData.append("end_date", payload.end_date);

      const response = await apiClient.post(`/ads`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  getBlogs: async () => {
    try {
      const response = await apiClient.get(`/blog-centers`);
      return response.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  getBlog: async (id: string | number) => {
    try {
      const response = await apiClient.get(`/blog-centers/${id}`);
      return response.data.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  requestBlog: async (payload: {
    cover: File;
    blog_image: File;
    title: string;
    description: string;
    content: string;
  }) => {
    try {
      const formData = new FormData();
      formData.append("title", payload.title);
      formData.append("description", payload.description);
      formData.append("cover", payload.cover);
      formData.append("blog_image", payload.blog_image);
      formData.append("content", payload.content);

      const response = await apiClient.post(`/blog-centers`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  updateBlog: async (
    id: string,
    payload: {
      cover: File;
      blog_image: File;
      title: string;
      description: string;
      content: string;
    },
  ) => {
    try {
      const response = await apiClient.post(`/blog-centers/${id}`, payload, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  getCenterStats: async () => {
    try {
      const response = await apiClient.get(`/center/statistics`);
      return response.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  getBranchStats: async () => {
    try {
      const response = await apiClient.get(`/branch/statistics`);
      return response.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  sendNotification: async (payload: {
    parent_ids: number[];
    title: string;
    date: string;
    time: string;
  }) => {
    try {
      const response = await apiClient.post(`/notify-parents`, payload);
      return response.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  getCenterData: async () => {
    try {
      const response = await apiClient.get(`/get-center`);
      return response.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  updateProfile: async (payload: {
    email: string;
    address: string;
    location: string;
    nursery_name: string;
    phone: string;
    city_id: number;
    neighborhood: string;
  }) => {
    try {
      const response = await apiClient.put(`/update-profile-center`, {
        ...payload,
        name: payload.nursery_name,
      });
      return response.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  getPlans: async () => {
    try {
      const response = await apiClient.get("/plans");
      return response.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  getSubscriptionsLog: async () => {
    try {
      const response = await apiClient.get("/get-history-payment");
      return response.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  // Legacy Portfolio endpoints
  legacySavePortfolio: async (payload: PortfolioFormData) => {
    try {
      console.log("📤 Sending legacy portfolio data:", payload);

      // Convert to FormData to handle file uploads
      const formData = new FormData();

      // Helper function to append data recursively
      const appendFormData = (key: string, value: any) => {
        if (value === undefined) {
          return;
        }

        // Handle image fields specially
        if (key.includes("image") || key.includes("background")) {
          if (typeof value === "string" && !key.includes("[")) {
            console.log(`⏭️  Skipping top-level image URL for ${key}`);
            return;
          }
        }

        if (value instanceof File) {
          formData.append(key, value);
        } else if (Array.isArray(value)) {
          if (value.length === 0) {
            return;
          }
          value.forEach((item, index) => {
            if (item === null || item === undefined) return;

            const itemKey = `${key}[${index}]`;
            if (item instanceof File) {
              formData.append(itemKey, item);
            } else if (typeof item === "object") {
              Object.keys(item).forEach((subKey) => {
                appendFormData(`${itemKey}[${subKey}]`, item[subKey]);
              });
            } else {
              formData.append(itemKey, String(item));
            }
          });
        } else if (typeof value === "object" && !(value instanceof File)) {
          Object.keys(value).forEach((subKey) => {
            appendFormData(`${key}[${subKey}]`, value[subKey]);
          });
        } else {
          formData.append(key, value === null ? "null" : String(value));
        }
      };

      Object.keys(payload).forEach((key) => {
        appendFormData(key, (payload as any)[key]);
      });

      const response = await apiClient.post("/portfolios", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error: any) {
      throw ApiErrorHandler.handle(error);
    }
  },

  legacyGetPortfolio: async () => {
    try {
      const response = await apiClient.get("/portfolios/show");
      return response.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  updateLogo: async (logo: File) => {
    try {
      const formData = new FormData();
      formData.append("logo", logo);

      const response = await apiClient.post("/update-logo", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  // New Portfolio endpoints
  savePortfolio: async (payload: PortfolioFormData, id?: number | string) => {
    try {
      console.log("📤 Sending updated portfolio data:", payload);
      const formData = new FormData();

      // Basic Info (Hero)
      if (payload.title_of_hero)
        formData.append("title_of_hero", payload.title_of_hero);
      if (payload.subtitle_of_hero)
        formData.append("subtitle_of_hero", payload.subtitle_of_hero);
      if (payload.description)
        formData.append("description", payload.description);

      // Social links
      if (payload.contact_info?.facebook)
        formData.append(
          "contact_info[facebook]",
          payload.contact_info.facebook,
        );
      if (payload.contact_info?.instagram)
        formData.append(
          "contact_info[instagram]",
          payload.contact_info.instagram,
        );
      if (payload.contact_info?.twitter)
        formData.append("contact_info[twitter]", payload.contact_info.twitter);
      if (payload.contact_info?.linkedIn)
        formData.append(
          "contact_info[linkedIn]",
          payload.contact_info.linkedIn,
        );
      if (payload.contact_info?.website)
        formData.append("contact_info[website]", payload.contact_info.website);

      // Activities
      payload.images_activities?.forEach((activity, index) => {
        const imageFile =
          activity instanceof File ? activity : activity.image instanceof File ? activity.image : null;

        if (imageFile) {
          formData.append(`images_activities[${index}]`, imageFile);
        }
      });
      payload.delete_images_activities?.forEach((index, i) => {
        formData.append(`delete_images_activities[${i}]`, String(index));
      });

      // Services
      payload.services?.forEach((service, index) => {
        if (service.id)
          formData.append(`services[${index}][id]`, String(service.id));
        formData.append(`services[${index}][title]`, service.title);
        formData.append(`services[${index}][description]`, service.description);
        formData.append(`services[${index}][price]`, service.price);
        if (service.image_service instanceof File) {
          formData.append(
            `services[${index}][image_service]`,
            service.image_service,
          );
        }
      });
      payload.delete_service_ids?.forEach((id, index) => {
        formData.append(`delete_service_ids[${index}]`, String(id));
      });

      // Options (Facilities)
      if (payload.admin_option_ids) {
        if (payload.admin_option_ids.length === 0) {
          formData.append("admin_option_ids", "");
        } else {
          payload.admin_option_ids.forEach((id, index) => {
            formData.append(`admin_option_ids[${index}]`, String(id));
          });
        }
      }

      // Licenses
      payload.licenses?.forEach((license, index) => {
        if (license.id)
          formData.append(`licenses[${index}][id]`, String(license.id));
        formData.append(`licenses[${index}][number]`, license.number);
        if (license.document instanceof File) {
          formData.append(`licenses[${index}][document]`, license.document);
        }
      });
      payload.delete_license_ids?.forEach((id, index) => {
        formData.append(`delete_license_ids[${index}]`, String(id));
      });

      const url = id ? `/nursery/portfolios/${id}` : "/nursery/portfolios";
      const response = await apiClient.post(url, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    } catch (error: any) {
      throw ApiErrorHandler.handle(error);
    }
  },

  getPortfolio: async () => {
    try {
      const response = await apiClient.get("/nursery/portfolios/show");
      return response.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  // Center-specific Portfolio endpoints
  saveCenterPortfolio: async (
    payload: PortfolioFormData,
    id?: number | string,
  ) => {
    try {
      console.log("📤 Sending center portfolio data:", payload);
      const formData = new FormData();

      // Basic Info (Hero)
      if (payload.name) formData.append("name", payload.name);
      if (payload.title_of_hero)
        formData.append("title_of_hero", payload.title_of_hero);
      if (payload.subtitle_of_hero)
        formData.append("subtitle_of_hero", payload.subtitle_of_hero);
      if (payload.description)
        formData.append("description", payload.description);

      // Social links
      if (payload.contact_info?.facebook)
        formData.append(
          "contact_info[facebook]",
          payload.contact_info.facebook,
        );
      if (payload.contact_info?.instagram)
        formData.append(
          "contact_info[instagram]",
          payload.contact_info.instagram,
        );
      if (payload.contact_info?.twitter)
        formData.append("contact_info[twitter]", payload.contact_info.twitter);
      if (payload.contact_info?.linkedIn)
        formData.append(
          "contact_info[linkedIn]",
          payload.contact_info.linkedIn,
        );
      if (payload.contact_info?.website)
        formData.append("contact_info[website]", payload.contact_info.website);

      // Activities (Success Stories)
      payload.images_activities?.forEach((activity, index) => {
        if (activity.id)
          formData.append(
            `images_activities[${index}][id]`,
            String(activity.id),
          );
        if (activity.image instanceof File) {
          formData.append(
            `images_activities[${index}][image_file]`,
            activity.image,
          );
        }
        if (activity.kind)
          formData.append(`images_activities[${index}][kind]`, activity.kind);
        if (activity.summary)
          formData.append(
            `images_activities[${index}][summary]`,
            activity.summary,
          );
      });
      payload.delete_images_activities?.forEach((id, i) => {
        formData.append(`delete_images_activities[${i}]`, String(id));
      });

      // Services
      payload.services?.forEach((service, index) => {
        if (service.id)
          formData.append(`services[${index}][id]`, String(service.id));
        formData.append(`services[${index}][title]`, service.title);
        formData.append(`services[${index}][description]`, service.description);
        formData.append(`services[${index}][price]`, service.price);
        if (service.image_service instanceof File) {
          formData.append(
            `services[${index}][image_service]`,
            service.image_service,
          );
        }
      });
      payload.delete_service_ids?.forEach((id, i) => {
        formData.append(`delete_service_ids[${i}]`, String(id));
      });

      // Teams
      payload.teams?.forEach((member, index) => {
        if (member.id)
          formData.append(`teams[${index}][id]`, String(member.id));
        formData.append(`teams[${index}][name]`, member.name);
        formData.append(`teams[${index}][mission]`, member.mission);
        if (member.image instanceof File) {
          formData.append(`teams[${index}][image]`, member.image);
        }
      });
      payload.delete_team_ids?.forEach((id, i) => {
        formData.append(`delete_team_ids[${i}]`, String(id));
      });

      // Statistics
      payload.statistics?.forEach((stat, index) => {
        if (stat.id)
          formData.append(`statistics[${index}][id]`, String(stat.id));
        formData.append(`statistics[${index}][address]`, stat.address);
        formData.append(`statistics[${index}][value]`, stat.value);
      });

      // Options (Facilities)
      if (payload.admin_option_ids) {
        if (payload.admin_option_ids.length === 0) {
          formData.append("admin_option_ids", "");
        } else {
          payload.admin_option_ids.forEach((id, index) => {
            formData.append(`admin_option_ids[${index}]`, String(id));
          });
        }
      }

      // Licenses
      payload.licenses?.forEach((license, index) => {
        if (license.id)
          formData.append(`licenses[${index}][id]`, String(license.id));
        formData.append(`licenses[${index}][number]`, license.number);
        if (license.document instanceof File) {
          formData.append(`licenses[${index}][document]`, license.document);
        }
      });
      payload.delete_license_ids?.forEach((id, index) => {
        formData.append(`delete_license_ids[${index}]`, String(id));
      });

      const url = "/center/portfolios";
      const response = await apiClient.post(url, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    } catch (error: any) {
      throw ApiErrorHandler.handle(error);
    }
  },

  getCenterPortfolio: async () => {
    try {
      const response = await apiClient.get("/center/portfolios/show");
      return response.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  // Pricing endpoints
  savePricing: async (payload: BranchPricingData[]) => {
    try {
      const response = await apiClient.post(
        "/create-or-update-branch-price",
        payload,
      );
      return response.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  deletePricing: async (id: string) => {
    try {
      const response = await apiClient.delete(`/delete-price/${id}`);
      return response.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  getBranchPricing: async (branchId: string) => {
    try {
      const response = await apiClient.get(`/branches-pricies/${branchId}`);
      return response.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  generateGateCode: async (branchId: string) => {
    try {
      const response = await apiClient.post(`/generate-code`, {
        branch_id: branchId,
      });
      return response.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  getAllAttendance: async () => {
    try {
      const response = await apiClient.get("/attendance-all");
      return response.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  getOptions: async () => {
    try {
      const response = await apiClient.get("/options");
      return response.data.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },
};

export const adminService = {
  createCenterType: async (name: string) => {
    try {
      const response = await apiClient.post("/dashboard/types", { name });
      return response.data.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  updateCenterType: async (id: string, name: string) => {
    try {
      const response = await apiClient.put(`/dashboard/types/${id}`, { name });
      return response.data.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  getCenterTypes: async () => {
    try {
      const response = await apiClient.get("/dashboard/types");
      return response.data.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  getCenters: async () => {
    try {
      const response = await apiClient.get("/dashboard/centers");
      return response.data.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  getBranches: async (centerId: string) => {
    try {
      const response = await apiClient.get(
        `/dashboard/branches/${centerId}/branches`,
      );
      return response.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  getBranch: async (branchId: string) => {
    try {
      const response = await apiClient.get(`/dashboard/branches/${branchId}`);
      return response.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  getChildren: async () => {
    try {
      const response = await apiClient.get(`/dashboard/childs`);
      return response.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  getChild: async (childId: string) => {
    try {
      const response = await apiClient.get(`/dashboard/childs/${childId}`);
      return response.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  getParents: async () => {
    try {
      const response = await apiClient.get(`/dashboard/parents`);
      return response.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  getParent: async (parentId: string) => {
    try {
      const response = await apiClient.get(`/dashboard/parents/${parentId}`);
      return response.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  getAdvertisements: async () => {
    try {
      const response = await apiClient.get(`/dashboard/ads-for-admin`);
      return response.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  getAdvertisement: async (adId: string) => {
    try {
      const response = await apiClient.get(`dashboard/ads-for-admin/${adId}`);
      return response.data.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  createAdvertisement: async (payload: {
    titleAr: string;
    titleEn: string;
    descriptionAr: string;
    descriptionEn: string;
    image: File;
    publish_date: string;
    end_date: string;
  }) => {
    try {
      const formData = new FormData();
      formData.append("title[ar]", payload.titleAr);
      formData.append("title[en]", payload.titleEn);
      formData.append("description[ar]", payload.descriptionAr);
      formData.append("description[en]", payload.descriptionEn);
      formData.append("image", payload.image);
      formData.append("publish_date", payload.publish_date);
      formData.append("end_date", payload.end_date);

      const response = await apiClient.post(
        `/dashboard/ads-for-admin`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );
      return response.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  updateAdvertisement: async (
    adId: string,
    payload: {
      titleAr?: string;
      titleEn?: string;
      descriptionAr?: string;
      descriptionEn?: string;
      image: File;
      publish_date?: string;
      end_date?: string;
    },
  ) => {
    try {
      const formData = new FormData();
      payload.titleAr && formData.append("title[ar]", payload.titleAr);
      payload.titleEn && formData.append("title[en]", payload.titleEn);
      payload.descriptionAr &&
        formData.append("description[ar]", payload.descriptionAr);
      payload.descriptionEn &&
        formData.append("description[en]", payload.descriptionEn);
      payload.image && formData.append("image", payload.image);
      payload.publish_date &&
        formData.append("publish_date", payload.publish_date);
      payload.end_date && formData.append("end_date", payload.end_date);

      const response = await apiClient.post(
        `/dashboard/ads-for-admin/${adId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );
      return response.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  deleteAdvertisement: async (adId: string) => {
    try {
      const response = await apiClient.delete(
        `/dashboard/ads-for-admin/${adId}`,
      );
      return response.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  getAllCenterAds: async () => {
    try {
      const response = await apiClient.get(`/dashboard/all-centers-ads`);
      return response.data.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  getOneCenterAds: async (centerId: string) => {
    try {
      const response = await apiClient.get(
        `/dashboard/all-for-specific-center/${centerId}`,
      );
      return response.data.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  getCenterAd: async (adId: string) => {
    try {
      const response = await apiClient.get(`/dashboard/specific-ad/${adId}`);
      return response.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  approveCenterAd: async (adId: string) => {
    try {
      const response = await apiClient.post(`/ads/${adId}/approve`);
      return response.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  rejectCenterAd: async (adId: string) => {
    try {
      const response = await apiClient.post(`/ads/${adId}/reject`);
      return response.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  getBlogs: async (page: number = 1) => {
    try {
      const response = await apiClient.get(`/dashboard/Blogs?page=${page}`);
      return response.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  getBlog: async (blogId: string | number) => {
    try {
      const response = await apiClient.get(`/dashboard/Blogs/${blogId}`);
      return response.data.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  createBlog: async (payload: {
    titleAr: string;
    titleEn: string;
    descriptionAr: string;
    descriptionEn: string;
    contentAr: string;
    contentEn: string;
    mainImage: File;
    cardImage: File;
  }) => {
    try {
      const formData = new FormData();
      formData.append("title[ar]", payload.titleAr);
      formData.append("title[en]", payload.titleEn);
      formData.append("description[ar]", payload.descriptionAr);
      formData.append("description[en]", payload.descriptionEn);
      formData.append("content[ar]", payload.contentAr);
      formData.append("content[en]", payload.contentEn);
      formData.append("image", payload.cardImage);
      formData.append("file", payload.mainImage);

      const response = await apiClient.post(`/dashboard/Blogs`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  updateBlog: async (
    blogId: string | number,
    payload: {
      titleAr?: string;
      titleEn?: string;
      descriptionAr?: string;
      descriptionEn?: string;
      contentAr?: string;
      contentEn?: string;
      mainImage?: File;
      cardImage?: File;
    },
  ) => {
    try {
      const formData = new FormData();
      payload.titleAr && formData.append("title[ar]", payload.titleAr);
      payload.titleEn && formData.append("title[en]", payload.titleEn);
      payload.descriptionAr &&
        formData.append("description[ar]", payload.descriptionAr);
      payload.descriptionEn &&
        formData.append("description[en]", payload.descriptionEn);
      payload.contentAr && formData.append("content[ar]", payload.contentAr);
      payload.contentEn && formData.append("content[en]", payload.contentEn);
      payload.cardImage && formData.append("image", payload.cardImage);
      payload.mainImage && formData.append("file", payload.mainImage);

      const response = await apiClient.post(
        `/dashboard/Blogs/${blogId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );
      return response.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  deleteBlog: async (blogId: string | number) => {
    try {
      const response = await apiClient.delete(`/dashboard/Blogs/${blogId}`);
      return response.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  getAllCenterBlogs: async () => {
    try {
      const response = await apiClient.get(`/dashboard/all-centers-blog`);
      return response.data.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  getOneCenterBlogs: async (centerId: string) => {
    try {
      const response = await apiClient.get(
        `/dashboard/all-for-specific-center-blog/${centerId}`,
      );
      return response.data.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  getCenterBlog: async (blogId: string | number) => {
    try {
      const response = await apiClient.get(`/dashboard/specific-ad/${blogId}`);
      return response.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  approveCenterBlog: async (blogId: string) => {
    try {
      const response = await apiClient.put(
        `/dashboard/update-status/${blogId}`,
        {
          status: "approved",
        },
      );
      return response.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  rejectCenterBlog: async (blogId: string) => {
    try {
      const response = await apiClient.put(
        `/dashboard/update-status/${blogId}`,
        {
          status: "rejected",
        },
      );
      return response.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  sendNotification: async (payload: {
    userIds: number[];
    title: string;
    date: string;
    time_start: string;
  }) => {
    try {
      const response = await apiClient.post(`/dashboard/notifiy-user`, payload);
      return response.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  getAdminStatistics: async () => {
    try {
      const response = await apiClient.get(`/admin/statistics`);
      return response.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  getAdminEnrollments: async () => {
    try {
      const response = await apiClient.get(`/dashboard/enrollments/all`);
      return response.data.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  acceptCenter: async (centerId: string) => {
    try {
      const response = await apiClient.put(
        `/dashboard/centers/${centerId}/confirm`,
      );
      return response.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  rejectCenter: async (centerId: string) => {
    try {
      const response = await apiClient.put(
        `/dashboard/centers/${centerId}/reject`,
      );
      return response.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  deleterCenter: async (centerId: string) => {
    try {
      const response = await apiClient.delete(`/dashboard/centers/${centerId}`);
      return response.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  getCentersSubscriptionsLog: async () => {
    try {
      const response = await apiClient.get("/get-history-payment");
      return response.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },
};

export const sidebarService = {
  getCenterBirthdays: async () => {
    try {
      const response = await apiClient.get(`/child-birthdays`);
      return response.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  getAdminBirthdays: async () => {
    try {
      const response = await apiClient.get(`/dashboard/birthdays`);
      return response.data.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  getParentBirthdays: async () => {
    try {
      const response = await apiClient.get(`/parent/birthdays`);
      return response.data.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  getCenterTasks: async () => {
    try {
      const response = await apiClient.get(`/to-do-centers`);
      return response.data.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  getCenterTask: async (taskId: string) => {
    try {
      const response = await apiClient.get(`/to-do-centers/${taskId}`);
      return response.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  createCenterTask: async (payload: {
    title: string;
    date: string;
    done: boolean;
  }) => {
    try {
      const response = await apiClient.post(`/to-do-centers`, payload);
      return response.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  updateCenterTask: async (
    taskId: string,
    payload: { title: string; date: string; done: boolean },
  ) => {
    try {
      const response = await apiClient.put(`/to-do-centers/${taskId}`, payload);
      return response.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  deleteCenterTask: async (taskId: string) => {
    try {
      const response = await apiClient.delete(`/to-do-centers/${taskId}`);
      return response.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  getCenterOccasions: async () => {
    try {
      const response = await apiClient.get(`/occassions`);
      return response.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  getCenterOccasion: async (occasionId: string) => {
    try {
      const response = await apiClient.get(`/occassions/${occasionId}`);
      return response.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  createCenterOccasion: async (payload: { title: string; date: string }) => {
    try {
      const response = await apiClient.post(`/occassions`, payload);
      return response.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  updateCenterOccasion: async (
    occasionId: string,
    payload: { title: string; date: string },
  ) => {
    try {
      const response = await apiClient.put(
        `/occassions/${occasionId}`,
        payload,
      );
      return response.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  deleteCenterOccasion: async (occasionId: string) => {
    try {
      const response = await apiClient.delete(`/occassions/${occasionId}`);
      return response.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  // admins and parents
  getTasks: async () => {
    try {
      const response = await apiClient.get(`/todos`);
      return response.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  getTask: async (taskId: string) => {
    try {
      const response = await apiClient.get(`/todos/${taskId}`);
      return response.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  createTask: async (payload: {
    title: string;
    date: string;
    done: boolean;
  }) => {
    try {
      const response = await apiClient.post(`/todos`, payload);
      return response.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  updateTask: async (
    taskId: string,
    payload: { title: string; date: string; done: boolean },
  ) => {
    try {
      const response = await apiClient.post(`/todos/${taskId}`, payload);
      return response.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  deleteTask: async (taskId: string) => {
    try {
      const response = await apiClient.delete(`/todos/${taskId}`);
      return response.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  getOccasions: async () => {
    try {
      const response = await apiClient.get(`/Occassion-both`);
      return response.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  getOccasion: async (occasionId: string) => {
    try {
      const response = await apiClient.get(`/Occassion-both/${occasionId}`);
      return response.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  createOccasion: async (payload: { title: string; date: string }) => {
    try {
      const response = await apiClient.post(`/Occassion-both`, payload);
      return response.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  updateOccasion: async (
    occasionId: string,
    payload: { title: string; date: string },
  ) => {
    try {
      const response = await apiClient.post(
        `/Occassion-both/${occasionId}`,
        payload,
      );
      return response.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  deleteOccasion: async (occasionId: string) => {
    try {
      const response = await apiClient.delete(`/Occassion-both/${occasionId}`);
      return response.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },
};

export const notificationService = {
  getNotifications: async () => {
    try {
      const response = await apiClient.get(`/notifications`);
      return response.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  readNotification: async (id: string) => {
    try {
      const response = await apiClient.patch(`/notifications/${id}/read`);
      return response.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  readAllNotifications: async () => {
    try {
      const response = await apiClient.patch(`/notifications/read-all`);
      return response.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },
};

export interface ApplyPromoCodeRequest {
  branch_price_id: number;
  branch_id: number;
  promo_code: string;
  child_count: number;
}

export interface ApplyPromoCodeResponse {
  promo_code: string;
  branch: string;
  center: string;
  original_amount: number;
  discount: number;
  final_amount: number;
  discount_type: string;
  paid_enrollments_count: number;
}

export const promoCodeService = {
  applyPromoCode: async (
    payload: ApplyPromoCodeRequest,
  ): Promise<ApplyPromoCodeResponse> => {
    try {
      const response = await apiClient.post(`/promo-codes/apply`, payload);
      return response.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },
};

export interface Enrollment {
  id: number;
  branch_id: number;
  branch_name: string;
  center_id: number;
  center_name: string;
  user_id: number;
  parent_phone: string;
  parent_name: string;
  price_amount: string;
  enrollment_type: string;
  response_speed: string;
  enrollment_date: string;
  status: string;
  center_branch_id?: number;
  branch_price_id?: number;
  children?: Array<{
    id: number;
    child_name: string;
    branch?: {
      name: string;
      nursery_name: string;
    };
  }>;
}

export interface EnrollmentsResponse {
  data: Enrollment[];
}
