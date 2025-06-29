# Project Overview
This project is a speed build challenge to build a fully functional Snapchat like app. The main difference between this app and Snapchat is that this app is for students and researchers, and all Snapchat content gets stored in a RAG database that can be intelligently queried via an AI Chatbot.

# High level requirememts
This must be a mobile app, deployable to both iOS and Android.

# Data architecture
The core element of this app is a vector database meant for performing RAG lookups of users pictures they submitted.  These are called 'thoughts".  Each entry will contain the submitted picture, the text description of the picture, the vector embedding of the description, and whether the "thought" was a "question", an "answer", or a "document".   Each "thought" is only associated with one "team" (described below).  Each "question" thought can be associated with one or many "answers" and "documents".  Each "answer" or "document" can be associated with many "questions".  However, they can only be associated if they have the same "team".

Each user is associated with one or more teams.  A team is simply a set of users.  By default, each user is associated to one team called "Personal", which includes that user only.  The purpose of "Teams" is mainly to allow the user to filter the RAG database to include only embeddings for the teams they have currently selected in the app.  It also enables security, disallowing users access to parts of the RAG database that are associated with teams that the user is not a part of.

Each team is associated with a collection of "thoughts" (elements of the vector database for RAG described above).  A "thought" is either a "question", and "answer", or a "document".  This categorization allows to associate each question with multiple "answers" and "documents".  The distinction between "answers" and "documents" only exists to allow the user of the front end to distinguish between them.  The purpose is to be able to display a question along with a series of "answers" and "documents" in a chronological chat like thread in the UI, so the time of creation will be needed.  Each "question" will have an associated "open" or "closed" state that determines whether new "answers" or "documents" can be associated with it.  Each "answer" and "document" will have a "pending confirmation" status.  When the app auto-assigns answers and documents to open questions, it will set this status, so that the user can distinguish which documents and answers were auto-suggested in response to a question.

# Theme
- Use a clean but memorable design
- It's a knowledge base app meant for learners (students, researchers, interest groups).
- Prefer descriptive icons with no text to ui elements with text
- Prefer round UI elements.  However, for elements like bottom bars, prefer showing no border to the buttons at all, and indicating the button is selected by highlighting with a different color


# Features
The main features of this app include:

## Knowledge-base page.
Have an AI Chatbot that can answer questions from the knowledge base associated with the current set of chosen teams.  The user can either request to search for thoughts directly from the vector database, or they can request to have the AI chatbot give an answer augmented with information from the vector database via RAG.  If requesting from the database, allow the user to filter by any combination of question type.

## Camera page
Similar to a regular camera app page.  The main difference is there are three buttons at the bottom: "ask", "answer", or "document" buttons.

Whenever either of the three are pressed, the camera will take a picture, then go to a simple photo editing mode like snapchat, where the user can draw on the page with a pen.  There will be three buttons at the bottom to confirm the edits, and determine what kind of thought was recorded (question, answer, or document)

Depending on which of the three buttons were pressed, the following logic will happen:

- if "question": search for answers in database that have already answered the question. If there are any, show a modal suggesting the top three to the user, with the option to present more. If user accepts a displayed answer as already answering his question, the user's question will be added as a "closed" question, and associated with the chosen answer. If user rejects, it is added as an "open" question to the database.

- if "answer": search for open questions in the database. Associate answer with each question it seems to address, with a special "pending confirmation" status.  Add the answer as a thought to the database

- if "document": treat the same as "answer".

## Thoughts page.
This is analogous to the snapchat chat window.  Shows list of questions, displayed as a summary sentence of the picture submitted with a thumbnail.  At the top there is a search bar, and quick filters.  Filters include "my thoughts" which are thoughts contributed by the current user, questions suggested to the current user to answer, and open questions.  Any combination of filters can be chosen.

When the user clicks a question, it opens a new window, analogous to opening a chat thread.

### Question thread window
In the chat thread window, a preview of the question picture displays as a banner image at the top, the summary of the question is listed just below.  Under the summary of the question, the chat thread lists the various answers and documents that have been associated to it, sorted by oldest to newest. NOTE THAT ONLY ANSWERS AND COMMENTS CAN BE ASSOCIATED TO A QUESTION.

There is a button at bottom of the window to reply to the question, which will navigate to the "camera" page, with metadata that this answer will apply to the associated question at least.
There will also be a "see related" button at the bottom of the window which will open a modal of related questions, found via vector database search.

#### Answer and document viewing window
If user clicks on an answer or document, it displays the associated answer picture fullscreen.  On the screen there will be a button to upvote the image, which will be stored as metadata on the thought.  If the current user is also the user that submitted the image, there will also be a button to "accept" the answer, which will transition the question from being an open question to closed.  When a question is closed, no further answers or documents are able to be posted to the thread.  There will also be a "see related" button at the bottom of the window which will open a modal of related questions, found via vector database search.

--- # Phases
Please split the implementation into two phases

## Phase 1: Core
Develop a complete writing assistant with the following essential features:

- Team change button always present at top right of the screen, for changing which teams the user is associating him or herself with. This is persistent state throughout the app that the user can change when in the questions page, camera page, or knowledge-base page.  The team change page should include the username of who is logged in, a button to create a new team, and a button to sign out.  The button to create a new team, when pressed, will ask the user for a team name, and a list of users to add.  Each user can be added by email address.  When added, the app will check if the user email exists in the database, and if not, will disallow the user to add the email, and tell the user to instruct their friend to sign up for the app.  When all emails are added, and the user clicks the button to create the team, the team will be created in the database.
- Knowledge-base page Implement just a direct question to OpenAI, do not use RAG or reference the thought database.
- Camera page for taking pictures, and uploading to the database
- Questions page for displaying questions in the current team context
- Question thread window for displaying answers to a given question as a chat like thread
- Answer and Docuemnt Viewing window for viewing picture and summary of associated "answer" or "document"
- User authentication
- App Start Page

--- ## Phase 2: AI Enhancement
In this phase, implement the RAG features to search knowledge-base built up by thoughts (TBD)

--- ## Ultimate Goal
Deliver a next-generation snap chat like app for aiding students, researchers, and learners in their courses, by providing a low effort way to create and build their own knowledge bases, and to answer each others questions to aid each other in learning.
