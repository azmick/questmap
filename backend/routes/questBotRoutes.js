const express = require('express');
const router = express.Router();
const { HfInference } = require('@huggingface/inference');

// Hugging Face API anahtarınızı buraya girin
const apiKey = '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'; // Buraya kendi API anahtarınızı girin

const hf = new HfInference(apiKey);

const generateText = async (prompt) => {
    try {
        // Modelin adı ve metin tamamlama girdisi
        const response = await hf.textGeneration({
            model: 'meta-llama/Llama-3.2-11B-Vision-Instruct',
            inputs: prompt,
            parameters: {
                max_new_tokens: 500, // Üretilen maksimum yeni token sayısını artırdık
                temperature: 0.7, // Çeşitlilik için sıcaklık değeri
                top_p: 0.9, // Sampling için top_p değeri
                repetition_penalty: 1.2 // Yanıtların tekrarını azaltmak için ceza oranı
            }
        });

        return response.generated_text;
    } catch (error) {
        console.error('Error:', error);
        throw new Error('Metin üretiminde bir hata oluştu');
    }
};

// Yeni bir route ekliyoruz ve generateText fonksiyonunu burada kullanıyoruz
router.post('/', async (req, res) => {
    const { prompt } = req.body;
    if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
    }

    try {
        const generatedText = await generateText(prompt);
        res.json({ response: generatedText });
    } catch (error) {
        res.status(500).json({ error: 'Metin üretiminde bir hata oluştu' });
    }
});

module.exports = router;
