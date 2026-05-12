CREATE TYPE "public"."gender_enum" AS ENUM('male', 'female', 'other');--> statement-breakpoint
CREATE TYPE "public"."relationship_type_enum" AS ENUM('marriage', 'biological_child', 'adopted_child');--> statement-breakpoint
CREATE TYPE "public"."user_role_enum" AS ENUM('admin', 'editor', 'member');--> statement-breakpoint
CREATE TABLE "custom_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"content" text,
	"event_date" date NOT NULL,
	"location" text,
	"created_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "accounts" (
	"userId" text NOT NULL,
	"type" text NOT NULL,
	"provider" text NOT NULL,
	"providerAccountId" text NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" text,
	"scope" text,
	"id_token" text,
	"session_state" text,
	CONSTRAINT "accounts_provider_providerAccountId_pk" PRIMARY KEY("provider","providerAccountId")
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"sessionToken" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"expires" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"emailVerified" timestamp,
	"name" text,
	"image" text,
	"password_hash" text,
	"role" "user_role_enum" DEFAULT 'member' NOT NULL,
	"is_active" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verificationTokens" (
	"identifier" text NOT NULL,
	"token" text NOT NULL,
	"expires" timestamp NOT NULL,
	CONSTRAINT "verificationTokens_identifier_token_pk" PRIMARY KEY("identifier","token")
);
--> statement-breakpoint
CREATE TABLE "person_details_private" (
	"person_id" uuid PRIMARY KEY NOT NULL,
	"phone_number" text,
	"occupation" text,
	"current_residence" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "persons" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"full_name" text NOT NULL,
	"gender" "gender_enum" NOT NULL,
	"birth_year" integer,
	"birth_month" integer,
	"birth_day" integer,
	"death_year" integer,
	"death_month" integer,
	"death_day" integer,
	"death_lunar_year" integer,
	"death_lunar_month" integer,
	"death_lunar_day" integer,
	"is_deceased" boolean DEFAULT false NOT NULL,
	"is_in_law" boolean DEFAULT false NOT NULL,
	"birth_order" integer,
	"generation" integer,
	"other_names" text,
	"avatar_url" text,
	"note" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "relationships" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" "relationship_type_enum" NOT NULL,
	"person_a" uuid NOT NULL,
	"person_b" uuid NOT NULL,
	"note" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "relationships_person_a_person_b_type_unique" UNIQUE("person_a","person_b","type"),
	CONSTRAINT "no_self_relationship" CHECK ("relationships"."person_a" != "relationships"."person_b")
);
--> statement-breakpoint
ALTER TABLE "custom_events" ADD CONSTRAINT "custom_events_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "person_details_private" ADD CONSTRAINT "person_details_private_person_id_persons_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."persons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "relationships" ADD CONSTRAINT "relationships_person_a_persons_id_fk" FOREIGN KEY ("person_a") REFERENCES "public"."persons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "relationships" ADD CONSTRAINT "relationships_person_b_persons_id_fk" FOREIGN KEY ("person_b") REFERENCES "public"."persons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_custom_events_date" ON "custom_events" USING btree ("event_date");--> statement-breakpoint
CREATE INDEX "idx_custom_events_created_by" ON "custom_events" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "idx_persons_full_name" ON "persons" USING btree ("full_name");--> statement-breakpoint
CREATE INDEX "idx_persons_generation" ON "persons" USING btree ("generation");--> statement-breakpoint
CREATE INDEX "idx_persons_gender" ON "persons" USING btree ("gender");--> statement-breakpoint
CREATE INDEX "idx_persons_is_deceased" ON "persons" USING btree ("is_deceased");--> statement-breakpoint
CREATE INDEX "idx_persons_birth_year" ON "persons" USING btree ("birth_year");--> statement-breakpoint
CREATE INDEX "idx_relationships_person_a" ON "relationships" USING btree ("person_a");--> statement-breakpoint
CREATE INDEX "idx_relationships_person_b" ON "relationships" USING btree ("person_b");--> statement-breakpoint
CREATE INDEX "idx_relationships_type" ON "relationships" USING btree ("type");