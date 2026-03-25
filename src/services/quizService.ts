import { apiClient } from "./api";
import { ApiErrorHandler } from "@/lib/error-handling";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Quiz {
  id: number;
  title: string;
  description: string;
  image: string;
  reading_time: string;
  from: string;
  to: string;
  status?: string;
  created_at?: string;
  views_count?: number;
  content?: QuizContent;
}

export interface QuizContent {
  id: number;
  description: string;
  quiz_id: number;
  partitions: Partition[];
}

export interface Partition {
  id: number;
  quiz_content_id: number;
  name: string;
  "partitions-points": PartitionPoint[];
  questions: Question[];
}

export interface PartitionPoint {
  id: number;
  partition_id: number;
  point: string;
}

export interface Question {
  id: number;
  partition_id: number;
  title: string;
  type: "text" | "multiple_choice";
  choices: Choice[];
}

export interface Choice {
  id: number;
  question_id: number;
  choice_text: string;
  is_correct: number | string;
}

export interface CreateQuizPayload {
  quiz_title: string;
  image: File;
  description: string;
  reading_time: string | number;
  from: string | number;
  to: string | number;
}

export interface UpdateQuizPayload {
  quiz_title?: string;
  image?: File;
  description?: string;
  reading_time?: string | number;
  from?: string | number;
  to?: string | number;
}

export interface CreateContentPayload {
  quiz_id: string;
  content_description: string;
}

export interface CreatePartitionPayload {
  quiz_content_id: string;
  name: string;
}

export interface CreatePartitionPointPayload {
  partition_id: string;
  point: string;
}

export interface CreateQuestionPayload {
  partition_id: string;
  type: "text" | "multiple_choice";
  question_title: string;
}

export interface CreateChoicePayload {
  question_id: string;
  choice_text: string;
  is_correct: "0" | "1";
}

// ─── Service ─────────────────────────────────────────────────────────────────

export const quizService = {
  // ── Quizzes ──────────────────────────────────────────────────────────────

  getAll: async () => {
    try {
      const response = await apiClient.get("/dashboard/quizzes");
      return response.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  getOne: async (id: string | number) => {
    try {
      const response = await apiClient.get(`/dashboard/quizzes/${id}`);
      return response.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  create: async (payload: CreateQuizPayload) => {
    try {
      const formData = new FormData();
      formData.append("quiz_title", payload.quiz_title);
      formData.append("description", payload.description);
      formData.append("reading_time", String(payload.reading_time));
      formData.append("from", String(payload.from));
      formData.append("to", String(payload.to));
      if (payload.image) {
        formData.append("image", payload.image);
      }

      const response = await apiClient.post("/dashboard/quizzes", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  update: async (id: string | number, payload: UpdateQuizPayload) => {
    try {
      const formData = new FormData();
      if (payload.quiz_title) formData.append("quiz_title", payload.quiz_title);
      if (payload.description)
        formData.append("description", payload.description);
      if (payload.reading_time)
        formData.append("reading_time", String(payload.reading_time));
      if (payload.from) formData.append("from", String(payload.from));
      if (payload.to) formData.append("to", String(payload.to));
      if (payload.image) formData.append("image", payload.image);

      const response = await apiClient.post(
        `/dashboard/quizzes/${id}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );
      return response.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  delete: async (id: string | number) => {
    try {
      const response = await apiClient.delete(`/dashboard/quizzes/${id}`);
      return response.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  publish: async (id: string | number) => {
    try {
      const response = await apiClient.patch(
        `/dashboard/quizzes/${id}/publish`,
      );
      return response.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  unpublish: async (id: string | number) => {
    try {
      const response = await apiClient.patch(
        `/dashboard/quizzes/${id}/publish`,
      );
      return response.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  // ── Quiz Content ─────────────────────────────────────────────────────────

  createContent: async (payload: CreateContentPayload) => {
    try {
      const response = await apiClient.post(
        "/dashboard/quiz-contents",
        payload,
      );
      return response.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  updateContent: async (
    id: string | number,
    payload: { content_description: string },
  ) => {
    try {
      const response = await apiClient.post(
        `/dashboard/quiz-contents/${id}`,
        payload,
      );
      return response.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  deleteContent: async (id: string | number) => {
    try {
      const response = await apiClient.delete(
        `/dashboard/quiz-contents/${id}`,
      );
      return response.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  // ── Partitions ───────────────────────────────────────────────────────────

  createPartition: async (payload: CreatePartitionPayload) => {
    try {
      const response = await apiClient.post(
        "/dashboard/partitions",
        payload,
      );
      return response.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  updatePartition: async (
    id: string | number,
    payload: { name: string },
  ) => {
    try {
      const response = await apiClient.post(
        `/dashboard/partitions/${id}`,
        payload,
      );
      return response.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  deletePartition: async (id: string | number) => {
    try {
      const response = await apiClient.delete(`/dashboard/partitions/${id}`);
      return response.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  // ── Partition Points ─────────────────────────────────────────────────────

  createPoint: async (payload: CreatePartitionPointPayload) => {
    try {
      const response = await apiClient.post(
        "/dashboard/partition-points",
        payload,
      );
      return response.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  updatePoint: async (
    id: string | number,
    payload: { point: string },
  ) => {
    try {
      const response = await apiClient.post(
        `/dashboard/partition-points/${id}`,
        payload,
      );
      return response.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  deletePoint: async (id: string | number) => {
    try {
      const response = await apiClient.delete(
        `/dashboard/partition-points/${id}`,
      );
      return response.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  // ── Questions ────────────────────────────────────────────────────────────

  createQuestion: async (payload: CreateQuestionPayload) => {
    try {
      const response = await apiClient.post(
        "/dashboard/questions",
        payload,
      );
      return response.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  updateQuestion: async (
    id: string | number,
    payload: { question_title?: string; type?: string },
  ) => {
    try {
      const response = await apiClient.post(
        `/dashboard/questions/${id}`,
        payload,
      );
      return response.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  deleteQuestion: async (id: string | number) => {
    try {
      const response = await apiClient.delete(`/dashboard/questions/${id}`);
      return response.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  // ── Choices ──────────────────────────────────────────────────────────────

  createChoice: async (payload: CreateChoicePayload) => {
    try {
      const response = await apiClient.post("/dashboard/choices", payload);
      return response.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  updateChoice: async (
    id: string | number,
    payload: { choice_text?: string; is_correct?: "0" | "1" },
  ) => {
    try {
      const response = await apiClient.post(
        `/dashboard/choices/${id}`,
        payload,
      );
      return response.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },

  deleteChoice: async (id: string | number) => {
    try {
      const response = await apiClient.delete(`/dashboard/choices/${id}`);
      return response.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  },
};
