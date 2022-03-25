# DxGov Decentralized Forum

### Background / Goals

- Social layer to Governance and proposals
- Give / receive feedback on proposals
- Seemlessly create on-chain proposal from Post

### Functionality

- Create / Edit Post
- Reply to Post / Comment
- Like Post / Comment

### Todo

- [x] OrbitDB posts + comments db
- [x] OrbitDB sync between browsers
- [x] OrbitDB Web3 Identity provider
  - [ ] https://github.com/orbitdb/orbit-db-identity-provider#creating-an-identity-with-an-ethereum-wallet
- [ ] OrbitDB connect identity when posting
- [x] Comments UI
- [ ] Create Post
- [ ] Edit Post
- [ ] Reply to Post / Comment
- [ ] Edit Post / Comment

# Basic Webpack template for Self.ID with TypeScript

Using the [Self.ID Framework](https://developers.ceramic.network/tools/self-id/framework/) with [Webpack](https://webpack.js.org/) and [TypeScript](https://www.typescriptlang.org/), using [SWC](https://swc.rs/) for compilation.

## Getting Started

### 1. Copy this template

```sh
npx degit ceramicstudio/self.id/templates/webpack-basic-typescript my-selfid-app
```

Replace `my-selfid-app` by the folder name you want and access it once installed.

### 2. Install dependencies

In your application folder:

```sh
npm install
# or
yarn install
```

### 3. Run scripts

Use `npm run` or `yarn run` with one of the following scripts:

- `dev`: compile and run a development server
- `build`: compile for production
- `serve`: run a local server for production build

## Learn More

Learn more about the [Self.ID SDK](https://developers.ceramic.network/tools/self-id/overview/) and [framework](https://developers.ceramic.network/tools/self-id/framework/) in the [Ceramic documentation](https://developers.ceramic.network/).

## License

Dual licensed under [MIT](https://github.com/ceramicstudio/self.id/blob/main/LICENSE-MIT) and [Apache 2](https://github.com/ceramicstudio/self.id/blob/main/LICENSE-APACHE).
