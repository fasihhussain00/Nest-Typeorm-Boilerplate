## Installation

```bash
$ pnpm install
```

## Running the app

```bash
$ pnpm run start
$ pnpm run start:dev
$ pnpm run start:prod
```

## Test

```bash
$ pnpm run test
$ pnpm run test:e2e
$ pnpm run test:cov
```

## **Deployment**

### Docker Image Build

- `docker run -d -p 5000:5000 --restart=always --name registry -v C:\docker-images:/var/lib/registry registry:2` For running local docker registry
- `docker build -f Dockerfile -t localhost:5000/nest-boilerplate:latest .` For building app image
- `docker tag localhost:5000/auth-boilerplate:latest {remote_domain}/{project_name}/{repo_name}/{image_name}:{image_tag}` tag images and add real values in placeholders e.g. {image_tag} could be "latest".

### Helm Deployment

- Make sure you have kubernetes installed in your system.
- Navigate to project root directory.
- `helm upgrade -i nest_boilerplate .\helm` to install backend helm release.
- `C:\Windows\System32\drivers\etc\hosts` open hosts file as an administrator.
- `127.0.0.1 nest-boilerplate.com` add this binding in `hosts` file.
- nest-boilerplate should be up on `http://nest-boilerplate.com`.

### GCloud Registry Authorization

- Download gcloud and install it in your system, and add path to environment. source: `https://dl.google.com/dl/cloudsdk/channels/rapid/GoogleCloudSDKInstaller.exe`
- `gcloud init` login with your organization account.
- `gcloud auth configure-docker us-east1-docker.pkg.dev` add artifact registry hosts to configurations.
- `gcloud auth print-access-token | docker login -u oauth2accesstoken --password-stdin https://us-east1-docker.pkg.dev` login docker with access token.
- `$ACCESS_TOKEN=$(gcloud auth print-access-token)` store access token to ACCESS_TOKEN variable
- `kubectl create secret docker-registry us-east1-k8-secret --docker-server=us-east1-docker.pkg.dev --docker-username=oauth2accesstoken --docker-password="$ACCESS_TOKEN"` login kubernetes with access token
- `kubectl config get-contexts` get all contexts
- `kubectl config use-context {context_name}` use context
- `kubectl config delete-context {context_name}` delete context

### Push Images

- `docker push localhost:5000/nest-boilerplate:latest`

### Pull Images

- `docker pull localhost:5000/nest-boilerplate:latest`

### Migrations

---

- `pnpm run migration:create --name=new-migration-nsme-small-description` create new empty migration file
- `pnpm run migration:generate --name=new-migration-nsme-small-description` generate new migration of all the changes made in schema
- `pnpm run migration:run` run all unapplied migrations
- `pnpm run migration:show` run all unapplied migrations
- `pnpm run migration:revert` revert last applied migration
