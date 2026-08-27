const path = require('path');
const fs = require('fs');

const viewsDir = path.join(__dirname, '../views/pages');

class ViewController {
    static renderHome(req, res) {
        res.sendFile(path.join(viewsDir, 'home.html'));
    }

    static renderExercise(req, res) {
        res.sendFile(path.join(viewsDir, 'exercise.html'));
    }

    static renderLogin(req, res) {
        if (req.cookies && req.cookies.codecase_admin_user) {
            return res.redirect('/admin/dashboard');
        }
        res.sendFile(path.join(viewsDir, 'login.html'));
    }

    static renderAdminDashboard(req, res) {
        res.sendFile(path.join(viewsDir, 'admin-dashboard.html'));
    }

    static renderAdminExerciseForm(req, res) {
        res.sendFile(path.join(viewsDir, 'admin-exercise-form.html'));
    }
}

module.exports = ViewController;
