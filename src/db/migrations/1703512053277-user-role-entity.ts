import { MigrationInterface, QueryRunner } from "typeorm";

export class UserRoleEntity1703512053277 implements MigrationInterface {
    name = 'UserRoleEntity1703512053277'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "role" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "id" SERIAL NOT NULL, "name" character varying NOT NULL, "permissions" text array NOT NULL DEFAULT '{}', CONSTRAINT "role_pk" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "role_name_unqiue_constraint" ON "role" ("name") WHERE (deleted_at IS NULL)`);
        await queryRunner.query(`CREATE TABLE "user" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "id" SERIAL NOT NULL, "source_id" character varying, "name" character varying NOT NULL, "email" character varying NOT NULL, "password" character varying, CONSTRAINT "user_pk" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "user_email_unqiue_constraint" ON "user" ("email") WHERE (deleted_at IS NULL)`);
        await queryRunner.query(`CREATE TABLE "user_role" ("user_id" integer NOT NULL, "role_id" integer NOT NULL, CONSTRAINT "PK_f634684acb47c1a158b83af5150" PRIMARY KEY ("user_id", "role_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_d0e5815877f7395a198a4cb0a4" ON "user_role" ("user_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_32a6fc2fcb019d8e3a8ace0f55" ON "user_role" ("role_id") `);
        await queryRunner.query(`ALTER TABLE "user_role" ADD CONSTRAINT "role_user_fk" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "user_role" ADD CONSTRAINT "user_role_fk" FOREIGN KEY ("role_id") REFERENCES "role"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_role" DROP CONSTRAINT "user_role_fk"`);
        await queryRunner.query(`ALTER TABLE "user_role" DROP CONSTRAINT "role_user_fk"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_32a6fc2fcb019d8e3a8ace0f55"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_d0e5815877f7395a198a4cb0a4"`);
        await queryRunner.query(`DROP TABLE "user_role"`);
        await queryRunner.query(`DROP INDEX "public"."user_email_unqiue_constraint"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP INDEX "public"."role_name_unqiue_constraint"`);
        await queryRunner.query(`DROP TABLE "role"`);
    }

}
