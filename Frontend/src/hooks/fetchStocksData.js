import axios from "axios";
import { useState } from "react";

const SERVER_URI = import.meta.env.VITE_SERVER_URI;

export const usefetchFiveDayBreakOut = () => {
  const [fiveDayBOData, setFiveDayBOData] = useState([]);
  const [fiveDayBOLoading, setLoading] = useState(null);
  const [fiveDayBOError, setError] = useState("");

  const fetchFiveDayBOData = async () => {
    try {
      setLoading(true);

      const response = await axios.get(`${SERVER_URI}/five-days-bo`);
      setFiveDayBOData(response);
    } catch (error) {
      console.log("error to get five day bo data", error);
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  return {
    fiveDayBOData,
    fiveDayBOLoading,
    fiveDayBOError,
    fetchFiveDayBOData,
  };
};
export const usefetchTenDayBreakOut = () => {
  const [tenDayBOData, setTenDayBOData] = useState([]);
  const [tenDayBOLoading, setLoading] = useState(null);
  const [tenDayBOError, setError] = useState("");

  const fetchTenDayBOData = async () => {
    try {
      setLoading(true);

      const response = await axios.get(`${SERVER_URI}/ten-days-bo`);

      setTenDayBOData(response);
    } catch (error) {
      console.log("error to get ten day bo data", error);
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  return { tenDayBOData, tenDayBOLoading, tenDayBOError, fetchTenDayBOData };
};
export const usefetchAiCandleBreakers = () => {
  const [AICandelBreakData, setAICandelBreakData] = useState([]);
  const [AICandelBreakDataLoading, setDlLoading] = useState(null);
  const [AICandelBreakDataError, setDlError] = useState("");

  const fetchAICandelBreakData = async () => {
    try {
      setDlLoading(true);

      const response = await axios.get(`${SERVER_URI}/ai-candle-breakers`);

      setAICandelBreakData(response);
    } catch (error) {
      console.log("error to get ai candle breakers data", error);
      setDlError(error);
    } finally {
      setDlLoading(false);
    }
  };

  return {
    AICandelBreakData,
    AICandelBreakDataLoading,
    AICandelBreakDataError,
    fetchAICandelBreakData,
  };
};
export const usefetchAiCandleReversal = () => {
  const [AICandelReversalData, setAICandelReversalData] = useState([]);
  const [AICandelReversalLoading, setLoading] = useState(null);
  const [AICandelReversalError, setError] = useState("");

  const fetchAICandelReversalData = async () => {
    try {
      setLoading(true);

      const response = await axios.get(`${SERVER_URI}/ai-candle-reversal`);

      setAICandelReversalData(response);
    } catch (error) {
      console.log("error to get ai candle reversal", error);
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  return {
    AICandelReversalData,
    AICandelReversalLoading,
    AICandelReversalError,
    fetchAICandelReversalData,
  };
};
export const usefetchAiContraction = () => {
  const [AiContractionData, setAiContractionData] = useState([]);
  const [AiContractionLoading, setLoading] = useState(null);
  const [AiContractionError, setError] = useState("");

  const fetchAiContractionData = async () => {
    try {
      setLoading(true);

      const response = await axios.get(`${SERVER_URI}/ai-contraction`);

      setAiContractionData(response);
    } catch (error) {
      console.log("error to get ai contraction", error);
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  return {
    AiContractionData,
    AiContractionLoading,
    AiContractionError,
    fetchAiContractionData,
  };
};
