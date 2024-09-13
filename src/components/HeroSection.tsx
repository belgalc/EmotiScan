import { motion } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import InputModeButton from "./InputModeButton";
import axios from "axios";
import { Language } from "../types/languages";

interface HeroSectionProps {
  onAnalyze: (text: string, language: string, results: AnalysisResults) => void;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const languageModels: Language = {
  fr: "Helsinki-NLP/opus-mt-en-fr",
  es: "Helsinki-NLP/opus-mt-en-es",
  de: "Helsinki-NLP/opus-mt-en-de",
  it: "Helsinki-NLP/opus-mt-en-it",
  ar: "Helsinki-NLP/opus-mt-en-ar",
};

interface EmotionResult {
  label: string;
  score: number;
}

interface SentimentResult {
  label: string;
  score: number;
}

interface SentimentAnalysis {
  positive: number;
  negative: number;
  neutral: number;
}

export interface AnalysisResults {
  emotions: EmotionResult[];
  sentiment: SentimentAnalysis;
}

const HeroSection = ({ onAnalyze }: HeroSectionProps) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [selectedInputMode, setSelectedInputMode] = useState<string>("text");
  const [inputText, setInputText] = useState<string>("");
  const [selectedLanguage, setSelectedLanguage] =
    useState<keyof typeof languageModels>("fr");

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleAnalyze = async () => {
    try {
      const response = await axios.post(
        "https://api-inference.huggingface.co/models/j-hartmann/emotion-english-distilroberta-base",
        { inputs: inputText },
        {
          headers: {
            Authorization: `Bearer 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`,
          },
        }
      );

      const emotions = response.data[0].map((result: EmotionResult) => ({
        label: result.label,
        score: result.score,
      }));

      const sentimentResponse = await axios.post(
        "https://api-inference.huggingface.co/models/cardiffnlp/twitter-roberta-base-sentiment-latest",
        { inputs: inputText },
        {
          headers: {
            Authorization: `Bearer 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`,
          },
        }
      );

      const sentimentResults = sentimentResponse.data[0];
      let dominantSentiment = sentimentResults[0];

      sentimentResults.forEach((result: SentimentResult) => {
        if (result.score > dominantSentiment.score) {
          dominantSentiment = result;
        }
      });

      const sentimentData: SentimentAnalysis = {
        positive:
          dominantSentiment.label === "positive" ? dominantSentiment.score : 0,
        negative:
          dominantSentiment.label === "negative" ? dominantSentiment.score : 0,
        neutral:
          dominantSentiment.label === "neutral" ? dominantSentiment.score : 0,
      };

      const results = { emotions, sentiment: sentimentData };
      onAnalyze(inputText, selectedLanguage, results);
    } catch (error) {
      console.error("Error analyzing text:", error);
    }
  };

  return (
    <section className="relative bg-black text-white min-h-screen flex items-center justify-center overflow-hidden">
      <motion.div
        className="absolute inset-0 z-0 bg-gradient-to-r from-black to-gray-800 opacity-70"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.9 }}
        transition={{ duration: 1.5 }}
      />

      <div className="absolute -top-10 -left-20 w-96 h-96 bg-cyan-500 opacity-20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-amber-400 opacity-30 rounded-full blur-3xl animate-pulse"></div>

      <div className="relative z-10 text-center max-w-3xl px-4">
        <motion.h1
          className="text-6xl font-extrabold tracking-tight mb-6"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          EmotiScan
        </motion.h1>

        <motion.p
          className="text-gray-300 text-xl mb-10"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          Uncover Sentiments and Emotions in Text & Comments. Enter your text or
          a URL to get started.
        </motion.p>

        <motion.div
          className="flex justify-center items-center space-x-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
        >
          <InputModeButton
            text="text"
            onClick={() => setSelectedInputMode("text")}
            selectedInputMode={selectedInputMode}
          />
          <InputModeButton
            text="URL"
            onClick={() => setSelectedInputMode("URL")}
            selectedInputMode={selectedInputMode}
          />
        </motion.div>

        <motion.div
          className="mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 1 }}
        >
          <input
            type="text"
            className="w-full max-w-xl mx-auto py-4 px-6 bg-gray-800 text-white placeholder-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 transition transform hover:scale-105 shadow-lg duration-200"
            placeholder={`Type or paste your ${selectedInputMode} here...`}
            ref={inputRef}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
          <button
            onClick={handleAnalyze}
            className="w-full max-w-xl mt-4 py-3 bg-cyan-500 hover:bg-cyan-600 text-white font-bold rounded-lg transition transform hover:scale-105 shadow-lg focus:outline-none duration-200"
          >
            Analyze
          </button>
          {/* <button
            onClick={handleTranslate}
            className="w-full max-w-xl mt-4 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg transition transform hover:scale-105 shadow-lg focus:outline-none duration-200"
            disabled={inputText.length === 0}
          >
            Translate
          </button> */}
          <select
            className="w-full max-w-xl mt-4 py-3 bg-gray-800 text-white rounded-lg"
            value={selectedLanguage}
            onChange={(e) =>
              setSelectedLanguage(e.target.value as keyof typeof languageModels)
            }
          >
            <option value="fr">French</option>
            <option value="es">Spanish</option>
            <option value="de">German</option>
            <option value="it">Italian</option>
            <option value="ar">Arabic</option>
          </select>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
