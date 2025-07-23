CREATE TABLE IF NOT EXISTS "users_table" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"plan" text NOT NULL,
	"stripe_id" text NOT NULL,
	CONSTRAINT "users_table_email_unique" UNIQUE("email")
);
