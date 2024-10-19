export interface RequestResponse {
  // Define the properties based on what your API returns
  success: boolean;
  message?: string;
  data?: any; // You can specify a more specific type based on your response structure
}
