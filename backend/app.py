from flask import Flask, request
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from flask_cors import CORS

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:admin@localhost/dashboard'
db = SQLAlchemy(app)
CORS(app)

class Todo(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(5000), nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    def __repr__(self):
        return f"Todo: (self.description)"

    def __init__(self, title, description):
        self.title = title
        self.description = description

def format_todo(todo):
    return {
        "title": todo.title,
        "description": todo.description,
        "id": todo.id,
        "created_at": todo.created_at
    }

@app.route('/')
def hello():
    return 'hey'

#get all todos
@app.route('/todos', methods=['GET'])
def get_todos():
    todos = Todo.query.order_by(Todo.created_at.asc()).all()
    todo_list = []
    for todo in todos:
        todo_list.append(format_todo(todo))
    return { 'todos': todo_list }

#get single todo
@app.route('/todos/<id>', methods = ['GET'])
def get_todo(id):
    todo = Todo.query.filter_by(id=id).one()
    formatted_todo = format_todo(todo)
    return { 'todo': formatted_todo }


#create a todosd
@app.route('/todos', methods = ['POST'])    
def create_todo():
    title = request.json['title']
    description = request.json['description']
    todo = Todo(title, description)
    db.session.add(todo)
    db.session.commit()
    return format_todo(todo)

@app.route('/todos/<id>', methods = ['DELETE'])
def delete_todo(id):
    todo = Todo.query.filter_by(id=id).one()
    db.session.delete(todo)
    db.session.commit()
    return f'Todo (id: {id}) deleted'

@app.route('/todos/<id>', methods = ['PUT'])
def update_todo(id):
    todo = Todo.query.filter_by(id=id)
    title = request.json['title']
    description = request.json['description']
    todo.update(dict(title = title,description = description, created_at = datetime.utcnow()))
    db.session.commit()
    return {'todo': format_todo(todo.one())}

if __name__ == '__main__':
    app.run()