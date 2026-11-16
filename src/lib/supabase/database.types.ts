import type { Category, Priority } from "@/types";

export type Database = {
  public: {
    Tables: {
      tasks: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          priority: Priority;
          category: Category;
          due_date: string | null;
          done: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          priority: Priority;
          category?: Category;
          due_date?: string | null;
          done?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          priority?: Priority;
          category?: Category;
          due_date?: string | null;
          done?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
      focus_sessions: {
        Row: {
          id: string;
          user_id: string;
          task_id: string | null;
          completed_at: string;
          duration_minutes: number;
          completed: boolean;
        };
        Insert: {
          id?: string;
          user_id: string;
          task_id?: string | null;
          completed_at?: string;
          duration_minutes: number;
          completed?: boolean;
        };
        Update: {
          task_id?: string | null;
          completed?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: "focus_sessions_task_id_fkey";
            columns: ["task_id"];
            isOneToOne: false;
            referencedRelation: "tasks";
            referencedColumns: ["id"];
          }
        ];
      };
      user_preferences: {
        Row: {
          user_id: string;
          daily_goal: number;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          daily_goal?: number;
          updated_at?: string;
        };
        Update: {
          daily_goal?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};
