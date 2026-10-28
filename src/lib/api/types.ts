export type Role = "ADMIN" | "EDITOR" | "AUTHOR" | "CONTRIBUTOR" | "SUBSCRIBER";

export interface User {
  id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  role: Role;
  is_verified: boolean;
  avatar: string | null;
  bio: string;
  date_joined: string;
}

export interface TokenPair {
  access: string;
  refresh: string;
}

/** The envelope the API uses for every list. */
export interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface LoginResponse {
  message: string;
  tokens: TokenPair;
  user: Pick<
    User,
    "id" | "email" | "username" | "first_name" | "last_name" | "role" | "is_verified"
  >;
}
