import React, { useState } from 'react';
import axios from 'axios';

function PredictionForm() {
    const [form, setForm] = useState({
        temperature: '',
        soil_ph: '',
        rainfall: '',
        field_area: '',
        humidity: ''
    });
    const [result, setResult] = useState(null);

    const handleChange = e => {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    const handleSubmit = async e => {
        e.preventDefault();
        const res = await axios.post('http://127.0.0.1:5000/predict', form);
        setResult(res.data);
    }

    return (
        <div>
            <h2>Paddy Yield Prediction</h2>
            <form onSubmit={handleSubmit}>
                {Object.keys(form).map((key) => (
                    <div key={key}>
                        <label>{key}:</label>
                        <input type="text" name={key} value={form[key]} onChange={handleChange} />
                    </div>
                ))}
                <button type="submit">Predict</button>
            </form>
            {result && (
                <div>
                    <h3>Predicted Yield: {result.predicted_yield} t/ha</h3>
                    <p>Advice: {result.advice}</p>
                </div>
            )}
        </div>
    );
}

export default PredictionForm;
