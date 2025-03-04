"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Schema } from "../../../amplify/data/resource";
import { signOut } from "aws-amplify/auth";
import { client, useAIGeneration } from "@/app/client";
import { SelectionSet } from "aws-amplify/api";

const selectionSet = [
  "id",
  "title",
  "content",
  "createdAt",
  "authorId",
  "author.*",
] as const;

type ArticleWithAuthor = SelectionSet<
  Schema["Article"]["type"],
  typeof selectionSet
>;

export default function ArticlePage() {
  const { id } = useParams();
  const router = useRouter();
  const [article, setArticle] = useState<ArticleWithAuthor | null>(null);
  const [{ data: summary, isLoading }, summarize] =
    useAIGeneration("summarize");

  useEffect(() => {
    const getArticle = async () => {
      try {
        const { data } = await client.models.Article.get(
          { id: id as string },
          { selectionSet: [...selectionSet] }
        );
        setArticle(data);
      } catch (error) {
        console.error("Error fetching article:", error);
        router.push("/");
      }
    };
    getArticle();
  }, [id]);

  if (!article) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10 backdrop-blur-sm bg-white/80">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1
              onClick={() => router.push("/")}
              className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent cursor-pointer hover:opacity-80 transition-opacity"
            >
              Amplify News Hub
            </h1>
            <button
              onClick={() => {
                signOut();
              }}
              className="bg-gray-100 text-gray-700 px-6 py-2.5 rounded-full hover:bg-gray-200 transition-all cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        {/* Article Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              Featured
            </span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {article.title}
          </h1>
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <span>By {article.author.email}</span>
            <span>•</span>
            <span>
              {new Date(article.createdAt).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
        </div>

        {/* Summary Section */}
        {(isLoading || summary) && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                Article Summary
              </h2>
            </div>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
              </div>
            ) : (
              <p className="text-gray-700 leading-relaxed">{summary}</p>
            )}
          </div>
        )}

        {/* Article Content */}
        <article className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
          <div className="prose prose-lg max-w-none">
            {article?.content
              ?.split("\n")
              .slice(1)
              .map((paragraph, index) => (
                <p key={index} className="mb-4 text-gray-700 leading-relaxed">
                  {paragraph}
                </p>
              ))}
          </div>
          <div className="mt-6 flex justify-end">
            <button
              onClick={() =>
                summarize({
                  input: article.content,
                })
              }
              className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 cursor-pointer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              Generate Summary
            </button>
          </div>
        </article>
      </main>
    </div>
  );
}
