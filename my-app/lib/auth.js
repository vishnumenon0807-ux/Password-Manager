import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { query } from "@/lib/db";

// Compared against when the email is unknown, so a login attempt for an
// account that does not exist takes as long as one with a wrong password.
// That stops anyone from timing the response to find out which emails
// have accounts.
const DUMMY_HASH = "$2b$12$3iDuV4s2QotAyeKW.dgQ8OWAHAaC5W4Nx9mmK/N0U5tSwQpG4P9L6";

export const googleEnabled = Boolean(
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
);

const providers = [
  CredentialsProvider({
    id: "credentials",
    name: "Email and password",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      const email = credentials?.email?.trim().toLowerCase();
      const password = credentials?.password;
      if (!email || !password) return null;

      const { rows } = await query(
        "SELECT id, name, email, image, password_hash FROM users WHERE email = $1",
        [email]
      );
      const user = rows[0];

      const matches = await bcrypt.compare(password, user?.password_hash ?? DUMMY_HASH);
      if (!user || !user.password_hash || !matches) return null;

      return {
        id: String(user.id),
        name: user.name,
        email: user.email,
        image: user.image,
      };
    },
  }),
];

if (googleEnabled) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  );
}

export const authOptions = {
  providers,

  // Sessions live in a signed, encrypted JWT cookie instead of a sessions
  // table. They expire after 8 hours.
  session: { strategy: "jwt", maxAge: 60 * 60 * 8 },

  pages: { signIn: "/login" },

  callbacks: {
    async signIn({ account, profile }) {
      if (account?.provider === "google") {
        // Only accept Google accounts whose email Google has verified,
        // since the email is what links the Google login to a user row.
        return Boolean(profile?.email && profile.email_verified !== false);
      }
      return true;
    },

    async jwt({ token, user, account, profile }) {
      // `account` is only present on the request where the user signs in.
      if (account?.provider === "google") {
        const { rows } = await query(
          `INSERT INTO users (name, email, image)
           VALUES ($1, $2, $3)
           ON CONFLICT (email) DO UPDATE
             SET name  = COALESCE(users.name, EXCLUDED.name),
                 image = COALESCE(users.image, EXCLUDED.image)
           RETURNING id, name`,
          [profile.name ?? null, profile.email.toLowerCase(), profile.picture ?? null]
        );
        token.uid = rows[0].id;
        token.name = rows[0].name;
      } else if (user) {
        token.uid = Number(user.id);
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) session.user.id = token.uid;
      return session;
    },
  },
};
