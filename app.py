from flask import Flask, render_template, request, redirect, url_for
import os
from ai.image_recognition import detect_item

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'static/uploads'

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload_image():
    if 'image' not in request.files:
        return "No image uploaded."
    
    image = request.files['image']
    if image.filename == '':
        return "No image selected."

    filepath = os.path.join(app.config['UPLOAD_FOLDER'], image.filename)
    image.save(filepath)

    item_name = detect_item(filepath)
    
    # Placeholder specs and price
    specs = f"Specs for {item_name}"
    price = "Fetching..."

    return render_template("auction.html", name=item_name, specs=specs, price=price)

if __name__ == '__main__':
    app.run(debug=True)
