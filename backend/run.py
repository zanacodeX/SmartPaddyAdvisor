from app import create_app
import logging

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

app = create_app()

if __name__ == "__main__":
    print("=" * 60)
    print("🚀 Smart Paddy Advisor Backend Starting...")
    print("=" * 60)
    print("✅ Disease Detection API available at: http://localhost:5000/api/health")
    print("=" * 60)
    app.run(debug=True, host='0.0.0.0', port=5000)
