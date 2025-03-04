"use client";

import { Schema } from "../amplify/data/resource";
import {
  getCurrentUser,
  GetCurrentUserOutput,
  signOut,
} from "aws-amplify/auth";
import { useEffect, useState } from "react";
import { client, useAIGeneration } from "./client";
import { SelectionSet } from "aws-amplify/api";
import Link from "next/link";

/* eslint-disable-next-line */
const selectionSet = [
  "id",
  "title",
  "content",
  "createdAt",
  "authorId",
  "author.*",
] as const;

type CreateArticleInput = Schema["Article"]["createType"];

type ArticleWithAuthor = SelectionSet<
  Schema["Article"]["type"],
  typeof selectionSet
>;

function FrontPage() {
  const [user, setUser] = useState<GetCurrentUserOutput | null>(null);
  const [articles, setArticles] = useState<ArticleWithAuthor[]>([]);

  // data is React state and will be populated when the generation is returned
  const [{ data, isLoading }, summarize] = useAIGeneration("summarize");

  const createArticles = async () => {
    const articles: CreateArticleInput[] = [
      {
        title: "Local Cat Elected as Town's 'Chief Nap Officer'",
        authorId: `${user?.username}::${user?.username}`,
        content: `Wed, March 12, 2025 at 2:15 PM EST
        
In an unprecedented move, Mr. Whiskers, a 6-year-old orange tabby, has been unanimously elected as Springfield's first Chief Nap Officer (CNO). The position, created by the town council, aims to promote better work-life balance and optimal napping techniques.

"Mr. Whiskers brings 20,000 hours of napping experience to the role," said Mayor Thompson. "His ability to fall asleep anywhere, at any time, is truly inspirational."

The feline executive plans to implement mandatory sunny spot rotations in all office buildings and will host weekly workshops on advanced purring techniques.`,
      },
      {
        title:
          "Scientists Confirm: Plants Enjoy Classical Music, But Hate Heavy Metal",
        authorId: `${user?.username}::${user?.username}`,

        content: `Fri, March 14, 2025 at 11:20 AM EST
        
A groundbreaking study from the Institute of Plant Psychology has revealed that houseplants show a strong preference for Mozart over Metallica. The research, conducted over six months, found that plants exposed to classical music grew 20% faster and produced more vibrant flowers.

"We were surprised to find that succulents in particular are quite the music snobs," lead researcher Dr. Sarah Green explained. "One cactus actually appeared to wilt in protest during a heavy metal concert."

Local garden centers have already begun installing classical music systems, though some rebel plants have been spotted secretly swaying to rock music after hours.`,
      },
      {
        title: "Man's Sourdough Starter Achieves Sentience, Files Taxes",
        authorId: `${user?.username}::${user?.username}`,
        content: `Sun, March 16, 2025 at 4:45 PM EST
        
In what experts are calling a "yeast of unusual intelligence," a local man's sourdough starter has reportedly gained consciousness and filed its first tax return. The starter, named "Dough-nald," began showing signs of advanced intelligence after being left to ferment for an unusually long weekend.

"At first, I thought I was hallucinating when it asked about W-2 forms," said owner Tom Baker. "But then it started giving me financial advice and suggesting better feeding schedules."

The IRS has confirmed receipt of the starter's tax return, noting it claimed several dependents - all of them being various loaves of bread produced throughout the year.`,
      },
    ];

    const newArticles = [];

    for (const article of articles) {
      const { data } = await client.models.Article.create(article, {
        authMode: "userPool",
        selectionSet: [...selectionSet],
      });

      newArticles.push(data);
    }

    setArticles(newArticles as ArticleWithAuthor[]);
  };

  const deleteArticles = async () => {
    for (const article of articles) {
      await client.models.Article.delete(
        { id: article.id },
        { authMode: "userPool" }
      );
    }

    setArticles([]);
  };

  const generateSummary = async (article: ArticleWithAuthor) => {
    await summarize({
      input: article.content,
    });
  };

  useEffect(() => {
    const getUser = async () => {
      try {
        const user = await getCurrentUser();

        if (user) setUser(user);
      } catch (error) {
        console.log(error);
        setUser(null);
      }
    };

    const getArticles = async () => {
      const { data } = await client.models.Article.list({
        authMode: user ? "userPool" : "identityPool",
        selectionSet: [...selectionSet],
      });

      setArticles(data);
    };

    if (!user) {
      getUser();
    }
    getArticles();
  }, [user]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10 backdrop-blur-sm bg-white/80">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Amplify News Hub
            </h1>

            <div className="flex items-center gap-2">
              {user ? (
                <>
                  <button
                    onClick={createArticles}
                    className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-6 py-2.5 rounded-full hover:opacity-90 transition-all shadow-sm hover:shadow-md cursor-pointer"
                  >
                    Create Articles
                  </button>
                  <button
                    onClick={deleteArticles}
                    className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-2.5 rounded-full hover:opacity-90 transition-all shadow-sm hover:shadow-md cursor-pointer"
                  >
                    Delete Articles
                  </button>
                  <button
                    onClick={async () => {
                      await signOut();
                      setUser(null);
                    }}
                    className="bg-gray-700 text-gray-200 px-6 py-2.5 rounded-full hover:bg-gray-600 transition-all cursor-pointer"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <Link
                  href="/signin"
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-6 py-2.5 rounded-full hover:opacity-90 transition-all shadow-sm hover:shadow-md cursor-pointer"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Summary Section */}
      {(isLoading || data) && (
        <div className="mt-12 bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
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
            <p className="text-gray-700 leading-relaxed">{data}</p>
          )}
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {/* Articles Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <article
              key={article?.id}
              className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
            >
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    Featured
                  </span>
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
                  {article?.title}
                </h2>
                <div className="prose prose-sm text-gray-600 mb-6 line-clamp-4">
                  {article?.content}
                </div>
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => generateSummary(article)}
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
                  <a
                    href={`/article/${article?.id}`}
                    className="text-sm text-gray-600 hover:text-gray-900 font-medium flex items-center gap-1"
                  >
                    Read More
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
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}

export default FrontPage;
