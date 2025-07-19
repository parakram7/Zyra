/* Basic reset */
* {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
}

body {
    font-family: Arial, sans-serif;
    background: #fff;
    color: #333;
    line-height: 1.6;
    padding: 0 1rem;
}

header {
    text-align: center;
    padding: 2rem 0 1rem;
}

header h1 {
    color: #2f855a;
    margin-bottom: 0.5rem;
}

.tagline {
    font-size: 1.2rem;
    color: #4a5568;
}

.donation-form {
    max-width: 500px;
    margin: 2rem auto;
    padding: 1.5rem;
    background: #f7fafc;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.donation-form h2 {
    text-align: center;
    margin-bottom: 1rem;
    color: #2f855a;
}

.donation-form label {
    display: block;
    margin-top: 1rem;
    margin-bottom: 0.25rem;
    font-weight: bold;
}

.donation-form input[type="text"],
.donation-form input[type="date"],
.donation-form input[type="file"],
.donation-form textarea {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #cbd5e0;
    border-radius: 4px;
    font-size: 1rem;
}

.donation-form button {
    margin-top: 1rem;
    width: 100%;
    padding: 0.75rem;
    background: #48bb78;
    color: #fff;
    border: none;
    border-radius: 4px;
    font-size: 1rem;
    cursor: pointer;
}

.donation-form button:hover {
    background: #38a169;
}

.why-donate {
    max-width: 600px;
    margin: 3rem auto;
    padding: 1rem;
}

.why-donate h2 {
    text-align: center;
    margin-bottom: 1rem;
    color: #2f855a;
}

.why-donate ul {
    list-style: disc inside;
    line-height: 1.5;
}

footer {
    background: #f0fff4;
    text-align: center;
    padding: 1rem;
    margin-top: 2rem;
}

footer .mission {
    font-weight: bold;
    margin-bottom: 0.5rem;
}

.socials {
    margin-bottom: 0.5rem;
}

.icon {
    margin: 0 0.25rem;
}

.hidden {
    display: none;
}

@media (max-width: 600px) {
    .donation-form {
        margin: 1rem auto;
        padding: 1rem;
    }
}
