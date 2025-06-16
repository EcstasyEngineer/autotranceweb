<<<<<<< HEAD
import NextAuth from "next-auth";
import { Role } from "@prisma/client";
=======
import NextAuth from "next-auth"
>>>>>>> cd77a9e63db42ba8cea66b70f42f7403c61f53a4

declare module "next-auth" {
  interface Session {
    user: {
<<<<<<< HEAD
      id: string;
      email: string;
      name?: string;
      role: Role;
    };
  }

  interface User {
    id: string;
    email: string;
    name?: string;
    role: Role;
=======
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
    }
  }

  interface User {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
>>>>>>> cd77a9e63db42ba8cea66b70f42f7403c61f53a4
  }
}

declare module "next-auth/jwt" {
  interface JWT {
<<<<<<< HEAD
    role: Role;
=======
    id: string
>>>>>>> cd77a9e63db42ba8cea66b70f42f7403c61f53a4
  }
}