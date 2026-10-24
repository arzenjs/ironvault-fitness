import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectDb } from "@/lib/db";
import User from "@/models/User";
import { loginSchema } from "@/lib/validation";

/**
 * Auth.js (v5) configuration.
 *
 * Design choices, documented because they are easy to get wrong:
 *
 * 1. JWT session strategy. Nothing sensitive is stored in the cookie beyond a
 *    signed JWT containing the user id, role and status. No session collection
 *    is needed, which keeps the deployment simple.
 * 2. Because the role/status live in the token, every privileged server action
 *    re-reads the user from MongoDB (see requireRole in lib/security.js). A
 *    disabled staff account therefore loses access immediately even though its
 *    old token is still cryptographically valid.
 * 3. Passwords are hashed with bcrypt (cost 12) and the hash column is
 *    `select: false`, so it is never loaded by accident.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      name: "Email and password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        await connectDb();
        const user = await User.findOne({ email }).select("+passwordHash");
        if (!user) {
          // Compare against a dummy hash so a missing account and a wrong
          // password take a similar amount of time.
          await bcrypt.compare(password, "$2a$12$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvalidinv");
          return null;
        }

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;
        if (user.status === "disabled") return null;

        await User.updateOne({ _id: user._id }, { $set: { lastLoginAt: new Date() } });

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role || "customer";
        token.status = user.status || "active";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role || "customer";
        session.user.status = token.status || "active";
      }
      return session;
    },
  },
});
