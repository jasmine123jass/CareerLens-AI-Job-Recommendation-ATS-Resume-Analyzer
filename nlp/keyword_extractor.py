from sklearn.feature_extraction.text import TfidfVectorizer
import re

def extract_keywords(text: str, top_n: int = 20):
    sentences = [s.strip() for s in re.split(r'[.\n]', text) if len(s.strip()) > 10]
    if not sentences:
        return []
    tfidf = TfidfVectorizer(max_features=200, stop_words='english', ngram_range=(1,2))
    try:
        tfidf.fit_transform(sentences)
        feature_names = tfidf.get_feature_names_out()
        scores = tfidf.idf_
        ranked = sorted(zip(feature_names, scores), key=lambda x: x[1])
        return [kw for kw, _ in ranked[:top_n]]
    except:
        return []