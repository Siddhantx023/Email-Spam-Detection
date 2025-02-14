import React, { useState, useCallback } from 'react';
import { SpamClassifier } from './lib/SpamClassifier';
import { Mail, Shield, AlertTriangle } from 'lucide-react';

// Sample training data
const trainingData = [
  { text: "Get rich quick! Buy now!", label: 1 },
  { text: "CONGRATULATIONS! You've won a prize!", label: 1 },
  { text: "Meeting scheduled for tomorrow", label: 0 },
  { text: "Please review the attached document", label: 0 },
  // Add more training examples as needed
];

function App() {
  const [classifier] = useState(() => {
    const clf = new SpamClassifier();
    clf.train(trainingData);
    return clf;
  });

  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState<{ prediction: number; confidence: number } | null>(null);

  const handleClassify = useCallback(() => {
    if (inputText.trim()) {
      const prediction = classifier.predict(inputText);
      setResult(prediction);
    }
  }, [inputText, classifier]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-800">Spam Email Detector</h1>
          </div>

          <div className="space-y-6">
            <div>
              <label htmlFor="email-content" className="block text-sm font-medium text-gray-700 mb-2">
                Enter email content
              </label>
              <textarea
                id="email-content"
                rows={6}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Paste email content here..."
              />
            </div>

            <button
              onClick={handleClassify}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              disabled={!inputText.trim()}
            >
              Analyze Email
            </button>

            {result && (
              <div className={`mt-6 p-4 rounded-lg ${
                result.prediction === 1 
                  ? 'bg-red-50 border border-red-200' 
                  : 'bg-green-50 border border-green-200'
              }`}>
                <div className="flex items-center gap-3">
                  {result.prediction === 1 ? (
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  ) : (
                    <Mail className="w-6 h-6 text-green-600" />
                  )}
                  <div>
                    <h3 className={`font-semibold ${
                      result.prediction === 1 ? 'text-red-800' : 'text-green-800'
                    }`}>
                      {result.prediction === 1 ? 'Potential Spam Detected' : 'Likely Legitimate Email'}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Confidence: {(result.confidence * 100).toFixed(2)}%
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;