export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          name: string
          email: string
          role: 'Admin' | 'Dispatcher' | 'Entry Operator' | 'Accountant'
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          email: string
          role: 'Admin' | 'Dispatcher' | 'Entry Operator' | 'Accountant'
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          email?: string
          role?: 'Admin' | 'Dispatcher' | 'Entry Operator' | 'Accountant'
          created_at?: string | null
          updated_at?: string | null
        }
      }
      sellers: {
        Row: {
          id: string
          name: string
          mobile_number: string
          address: string
          shop_name: string
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          mobile_number: string
          address: string
          shop_name: string
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          mobile_number?: string
          address?: string
          shop_name?: string
          created_at?: string | null
          updated_at?: string | null
        }
      }
      suppliers: {
        Row: {
          id: string
          name: string
          contact_number: string
          address: string
          product_category: string
          plant_name: string
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          contact_number: string
          address: string
          product_category?: string
          plant_name: string
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          contact_number?: string
          address?: string
          product_category?: string
          plant_name?: string
          created_at?: string | null
          updated_at?: string | null
        }
      }
      vehicles: {
        Row: {
          id: string
          transport_name: string
          driver_name: string
          vehicle_no: string
          date_time: string
          product_info: string
          quantity: number | null
          plant: string | null
          advance: number | null
          status: 'Active' | 'Idle' | 'Maintenance'
          created_at: string | null
          updated_at: string | null
          transport_mobile: string | null
          driver_mobile: string
        }
        Insert: {
          id?: string
          transport_name: string
          driver_name: string
          vehicle_no: string
          date_time?: string
          product_info?: string
          quantity?: number | null
          plant?: string | null
          advance?: number | null
          status?: 'Active' | 'Idle' | 'Maintenance'
          created_at?: string | null
          updated_at?: string | null
          transport_mobile?: string | null
          driver_mobile: string
        }
        Update: {
          id?: string
          transport_name?: string
          driver_name?: string
          vehicle_no?: string
          date_time?: string
          product_info?: string
          quantity?: number | null
          plant?: string | null
          advance?: number | null
          status?: 'Active' | 'Idle' | 'Maintenance'
          created_at?: string | null
          updated_at?: string | null
          transport_mobile?: string | null
          driver_mobile?: string
        }
      }
      bilties: {
        Row: {
          id: string
          bilty_number: string
          seller_id: string
          vehicle_no: string
          delivery_address: string
          rent: number
          advance: number
          driver_tips: number
          status: 'Pending' | 'In Transit' | 'Delivered'
          created_at: string | null
          updated_at: string | null
          total_crates_bags: number | null
        }
        Insert: {
          id?: string
          bilty_number: string
          seller_id: string
          vehicle_no: string
          delivery_address: string
          rent?: number
          advance?: number
          driver_tips?: number
          status?: 'Pending' | 'In Transit' | 'Delivered'
          created_at?: string | null
          updated_at?: string | null
          total_crates_bags?: number | null
        }
        Update: {
          id?: string
          bilty_number?: string
          seller_id?: string
          vehicle_no?: string
          delivery_address?: string
          rent?: number
          advance?: number
          driver_tips?: number
          status?: 'Pending' | 'In Transit' | 'Delivered'
          created_at?: string | null
          updated_at?: string | null
          total_crates_bags?: number | null
        }
      }
      products: {
        Row: {
          id: string
          bilty_id: string
          product_type: string
          quantity: number
          unit: string
          kg_weight: number | null
          created_at: string | null
        }
        Insert: {
          id?: string
          bilty_id: string
          product_type?: string
          quantity?: number
          unit?: string
          kg_weight?: number | null
          created_at?: string | null
        }
        Update: {
          id?: string
          bilty_id?: string
          product_type?: string
          quantity?: number
          unit?: string
          kg_weight?: number | null
          created_at?: string | null
        }
      }
      product_details: {
        Row: {
          id: string
          bilty_id: string
          product_name: string
          unit_type: string
          quantity: number
          total_crates_bags: number
          remarks: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          bilty_id: string
          product_name: string
          unit_type: string
          quantity: number
          total_crates_bags?: number
          remarks?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          bilty_id?: string
          product_name?: string
          unit_type?: string
          quantity?: number
          total_crates_bags?: number
          remarks?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      schedules: {
        Row: {
          id: string
          shift: 'Morning' | 'Evening'
          in_time: string
          out_time: string
          driver_id: string
          operating_days: number
          tax_deduction: number
          final_payment: number
          date: string
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          shift: 'Morning' | 'Evening'
          in_time: string
          out_time: string
          driver_id: string
          operating_days?: number
          tax_deduction?: number
          final_payment?: number
          date: string
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          shift?: 'Morning' | 'Evening'
          in_time?: string
          out_time?: string
          driver_id?: string
          operating_days?: number
          tax_deduction?: number
          final_payment?: number
          date?: string
          created_at?: string | null
          updated_at?: string | null
        }
      }
      billing_records: {
        Row: {
          id: string
          vehicle_no: string
          date: string
          amount: number
          seller_id: string
          advance: number
          net_amount: number
          status: 'Paid' | 'Pending' | 'Overdue'
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          vehicle_no: string
          date: string
          amount?: number
          seller_id: string
          advance?: number
          net_amount?: number
          status?: 'Paid' | 'Pending' | 'Overdue'
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          vehicle_no?: string
          date?: string
          amount?: number
          seller_id?: string
          advance?: number
          net_amount?: number
          status?: 'Paid' | 'Pending' | 'Overdue'
          created_at?: string | null
          updated_at?: string | null
        }
      }
      billing_records_new: {
        Row: {
          id: string
          bilty_id: string
          commission: number
          driver_paid: number
          net_total: number
          billing_date: string
          remark: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          bilty_id: string
          commission?: number
          driver_paid?: number
          net_total?: number
          billing_date?: string
          remark?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          bilty_id?: string
          commission?: number
          driver_paid?: number
          net_total?: number
          billing_date?: string
          remark?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      billing_product_lines: {
        Row: {
          id: string
          billing_id: string
          product_detail_id: string
          sold_price: number
          total_amount: number
          created_at: string | null
        }
        Insert: {
          id?: string
          billing_id: string
          product_detail_id: string
          sold_price?: number
          total_amount?: number
          created_at?: string | null
        }
        Update: {
          id?: string
          billing_id?: string
          product_detail_id?: string
          sold_price?: number
          total_amount?: number
          created_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}