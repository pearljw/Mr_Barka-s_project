# import sqlite3
import mysql.connector
from flask import Flask, render_template, request, redirect, url_for



def create_app():
    """Flash Card project"""
    
    app = Flask(__name__, template_folder='templates', static_folder='static')

    # Database connection
    db = mysql.connector.connect(
        host="localhost",
        user="root",
        password="",
        database="flash_card_project"
    )
    
    # SQLite database connection
    # db_path = 'flash_card_project.db'
    # app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{db_path}'
    # app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    # # Initialize database
    # db = sqlite3.connect(db_path)
    cursor = db.cursor()

    # Index route - show landing page
    @app.route('/')
    def index():
        return render_template('index.html')

    # Flashcards route - show all flashcards
    @app.route('/flashcards')
    def flashcards():
        try:
            cursor.execute("SELECT * FROM flashcards")
            flashcards = cursor.fetchall()
            
        except Exception:
            flashcards = []
            print('Missing table from the file')
    
        return render_template('flash.html', flashcards=flashcards)

    # Add new flashcard
    @app.route('/add', methods=['POST'])
    def add_flashcard():
        if request.method == 'POST':
            question = request.form['question']
            answer = request.form['answer']
            # Default to 'General' if not provided
            category = request.form.get('category', 'General')

            cursor.execute(
                "INSERT INTO flashcards (question, answer, category) VALUES (%s, %s, %s)", (question, answer, category))
            db.commit()
            return redirect(url_for('flashcards'))

    # Edit flashcard
    @app.route('/edit/<int:id>', methods=['POST'])
    def edit_flashcard(id):
        if request.method == 'POST':
            question = request.form['question']
            answer = request.form['answer']
            # Default to 'General' if not provided
            category = request.form.get('category', 'General')

            cursor.execute("UPDATE flashcards SET question=%s, answer=%s, category=%s WHERE id=%s",
                           (question, answer, category, id))
            db.commit()
            return redirect(url_for('flashcards'))

    # Delete flashcard
    @app.route('/delete/<int:id>')
    def delete_flashcard(id):
        cursor.execute("DELETE FROM flashcards WHERE id=%s", (id,))
        db.commit()
        return redirect(url_for('flashcards'))

    # View flashcard detail (if needed)
    @app.route('/flashcard/<int:id>')
    def flashcard_detail(id):
        cursor.execute("SELECT * FROM flashcards WHERE id=%s", (id,))
        flashcard = cursor.fetchone()
        return render_template('flash.html', flashcard=flashcard)

    return app


if __name__ == "__main__":
    create_app().run(debug=True)
