CREATE TABLE "requests" (
	"day" text,
	"endpoint" text,
	"count" integer NOT NULL,
	CONSTRAINT "requests_pkey" PRIMARY KEY("day","endpoint")
);
