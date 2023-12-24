import { MigrationInterface, QueryRunner } from "typeorm";

export class UserEntity1703387177172 implements MigrationInterface {
    name = 'UserEntity1703387177172'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "user" ("id" SERIAL NOT NULL, "source_id" character varying, "name" character varying NOT NULL, "email" character varying NOT NULL, "password" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "email_unqiue_constraint" ON "user" ("email") WHERE (deleted_at IS NULL)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."email_unqiue_constraint"`);
        await queryRunner.query(`DROP TABLE "user"`);
    }

}
