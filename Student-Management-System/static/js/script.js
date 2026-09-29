/**
 * Student Management System - Client-side JavaScript
 * Handles responsive sidebar toggling, form validations, and delete confirmation modal.
 */

document.addEventListener('DOMContentLoaded', () => {
    // ----------------------------------------------------
    // 1. Mobile Sidebar Navigation Toggle
    // ----------------------------------------------------
    const sidebar = document.getElementById('sidebar');
    const menuToggleBtn = document.getElementById('menuToggleBtn');
    const sidebarCloseBtn = document.getElementById('sidebarCloseBtn');

    if (menuToggleBtn && sidebar) {
        menuToggleBtn.addEventListener('click', () => {
            sidebar.classList.toggle('open');
        });
    }

    if (sidebarCloseBtn && sidebar) {
        sidebarCloseBtn.addEventListener('click', () => {
            sidebar.classList.remove('open');
        });
    }

    // Close sidebar on clicking outside on mobile devices
    document.addEventListener('click', (e) => {
        if (sidebar && sidebar.classList.contains('open')) {
            if (!sidebar.contains(e.target) && !menuToggleBtn.contains(e.target)) {
                sidebar.classList.remove('open');
            }
        }
    });

    // ----------------------------------------------------
    // 2. Auto-dismiss Flash Alerts
    // ----------------------------------------------------
    const flashMessages = document.querySelectorAll('.alert');
    if (flashMessages.length > 0) {
        setTimeout(() => {
            flashMessages.forEach((alert) => {
                alert.style.transition = 'opacity 0.5s ease';
                alert.style.opacity = '0';
                setTimeout(() => alert.remove(), 500);
            });
        }, 5000);
    }

    // ----------------------------------------------------
    // 3. Delete Confirmation Modal
    // ----------------------------------------------------
    const deleteModal = document.getElementById('deleteModal');
    const modalCloseBtn = document.getElementById('modalCloseBtn');
    const modalCancelBtn = document.getElementById('modalCancelBtn');
    const deleteForm = document.getElementById('deleteStudentForm');
    const deleteStudentName = document.getElementById('deleteStudentName');
    const deleteStudentRoll = document.getElementById('deleteStudentRoll');

    // Attach click listeners to all delete buttons
    const deleteButtons = document.querySelectorAll('.delete-student-btn');
    deleteButtons.forEach((btn) => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const studentId = btn.getAttribute('data-id');
            const studentName = btn.getAttribute('data-name');
            const studentRoll = btn.getAttribute('data-roll');

            if (deleteModal && deleteForm) {
                deleteStudentName.textContent = studentName || 'Student';
                deleteStudentRoll.textContent = studentRoll ? `Roll: ${studentRoll}` : '';
                deleteForm.action = `/student/delete/${studentId}`;
                deleteModal.style.display = 'flex';
            }
        });
    });

    function closeModal() {
        if (deleteModal) {
            deleteModal.style.display = 'none';
        }
    }

    if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
    if (modalCancelBtn) modalCancelBtn.addEventListener('click', closeModal);

    // Close modal when clicking on dark backdrop
    if (deleteModal) {
        deleteModal.addEventListener('click', (e) => {
            if (e.target === deleteModal) {
                closeModal();
            }
        });
    }

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && deleteModal && deleteModal.style.display === 'flex') {
            closeModal();
        }
    });

    // ----------------------------------------------------
    // 4. Form Validation Enhancements
    // ----------------------------------------------------
    const studentForm = document.getElementById('studentForm') || document.getElementById('editStudentForm');
    if (studentForm) {
        studentForm.addEventListener('submit', (e) => {
            const emailInput = document.getElementById('email');
            const phoneInput = document.getElementById('phone');
            const rollInput = document.getElementById('roll_number');

            if (emailInput && !emailInput.value.includes('@')) {
                alert('Please enter a valid email address.');
                emailInput.focus();
                e.preventDefault();
                return;
            }

            if (phoneInput && phoneInput.value.trim().length < 7) {
                alert('Please enter a valid phone number (at least 7 digits).');
                phoneInput.focus();
                e.preventDefault();
                return;
            }

            if (rollInput && rollInput.value.trim() === '') {
                alert('Roll number is mandatory.');
                rollInput.focus();
                e.preventDefault();
                return;
            }
        });
    }

    // ----------------------------------------------------
    // 5. Marks Validation (Marks <= Max Marks)
    // ----------------------------------------------------
    const marksForm = document.getElementById('marksForm');
    if (marksForm) {
        marksForm.addEventListener('submit', (e) => {
            const marksObtained = parseFloat(document.getElementById('marks_obtained').value);
            const maxMarks = parseFloat(document.getElementById('max_marks').value);

            if (isNaN(marksObtained) || isNaN(maxMarks)) {
                alert('Please enter valid numerical marks.');
                e.preventDefault();
                return;
            }

            if (marksObtained < 0) {
                alert('Marks obtained cannot be negative.');
                e.preventDefault();
                return;
            }

            if (marksObtained > maxMarks) {
                alert(`Marks scored (${marksObtained}) cannot be higher than Maximum Marks (${maxMarks})!`);
                e.preventDefault();
                return;
            }
        });
    }
});
