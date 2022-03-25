import React, { useState } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
import { ChakraProvider } from "@chakra-ui/react";

import Forum from "./pages/Forum";
import NewPost from "./pages/NewPost";
import ViewPost from "./pages/ViewPost";
import UserProfile from "./pages/UserProfile";

import Layout from "./components/Layout";

import OrbitProvider from "./providers/Orbit";
import { Provider as CeramicProvider } from "@self.id/react";
import type { ModelTypeAliases, ModelTypesToAliases } from "@glazed/types";

import publishedModel from "./model.json";

const model: ModelTypesToAliases<ModelTypeAliases<{}, {}>> = publishedModel;

const queryClient = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: false } },
});

function App() {
  return (
    <CeramicProvider
      client={{
        ceramic: "testnet-clay",
        connectNetwork: "testnet-clay",
        model,
      }}
    >
      <QueryClientProvider client={queryClient}>
        <OrbitProvider>
          <ChakraProvider>
            <HashRouter>
              <Layout>
                <Routes>
                  <Route path="/" element={<Forum />} />
                  <Route path="/new" element={<NewPost />} />
                  <Route path="/u/:did" element={<UserProfile />} />
                  <Route path="/:postId" element={<ViewPost />} />
                  <Route path="/:postId/edit" element={<ViewPost />} />
                  <Route
                    path="/:postId/:commentId/:action"
                    element={<ViewPost />}
                  />
                </Routes>
              </Layout>
            </HashRouter>
          </ChakraProvider>
        </OrbitProvider>
      </QueryClientProvider>
    </CeramicProvider>
  );
}

/*


ForumPage (query type === post)
  Topic
    title
    created, updated
    # comments, likes
  Topic
    ...

TopicPage
  title
  content
  likes
  comments
    Comment
      content
      likes
      comments



*/

export default App;
