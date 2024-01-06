import { MigrationInterface, QueryRunner } from "typeorm";

export class PlayerEntity1704524765185 implements MigrationInterface {
    name = 'PlayerEntity1704524765185'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "player" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "id" SERIAL NOT NULL, "username" character varying NOT NULL, "activision_id" character varying NOT NULL, "user_id" integer NOT NULL, CONSTRAINT "REL_d04e64fc9b7fd372000c0dfda3" UNIQUE ("user_id"), CONSTRAINT "player_pk" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "player_username_uc" ON "player" ("username") WHERE (deleted_at IS NULL)`);
        await queryRunner.query(`ALTER TABLE "player" ADD CONSTRAINT "user_player_fk" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "player" DROP CONSTRAINT "user_player_fk"`);
        await queryRunner.query(`DROP INDEX "public"."player_username_uc"`);
        await queryRunner.query(`DROP TABLE "player"`);
    }

}
