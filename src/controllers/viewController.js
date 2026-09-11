const path = require('path');
const fs = require('fs');

const viewsDir = path.join(__dirname, '../views/pages');

class viewController {
    static renderHome(req, res) {
        res.sendFile(path.join(viewsDir, 'home_page.html'));
    }

    static renderExercise(req, res) {
        res.sendFile(path.join(viewsDir, 'exercise_page.html'));
    }

    static renderSendExercise(req, res){
        res.sendFile(path.join(viewsDir, 'send_exercise_form.html'))
    }

    static renderLogin(req, res) {
        if (req.cookies && req.cookies.codecase_admin_user) {
            return res.redirect('/admin/dashboard');
        }
        res.sendFile(path.join(viewsDir, 'login_page.html'));
    }

    static renderAdminDashboard(req, res) {
        res.sendFile(path.join(viewsDir, 'admin_dashboard.html'));
    }

    static renderAdminExerciseForm(req, res) {
        res.sendFile(path.join(viewsDir, 'admin_exercise_form.html'));
    }
}

module.exports = viewController;
