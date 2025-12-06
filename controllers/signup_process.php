<?php
session_start();
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
header('Content-Type: application/json');

// Include DB
require_once __DIR__ . '/../config/db_connection.php';

// Sanitize function
function sanitize_input($data) {
    return htmlspecialchars(trim($data), ENT_QUOTES, 'UTF-8');
}

// Get POST data
$fullName = sanitize_input($_POST['fullName'] ?? '');
$email = sanitize_input($_POST['email'] ?? '');
$password = $_POST['password'] ?? '';
$confirmPassword = $_POST['confirmPassword'] ?? '';

if ($fullName === '' || $email === '' || $password === '' || $confirmPassword === '') {
    echo json_encode(['success' => false, 'message' => 'Please fill all fields']);
    exit();
}

// Validate email
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['success' => false, 'message' => 'Invalid email address']);
    exit();
}

// Check password match
if ($password !== $confirmPassword) {
    echo json_encode(['success' => false, 'message' => 'Passwords do not match']);
    exit();
}

// Check if email already exists
$stmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
$stmt->bind_param('s', $email);
$stmt->execute();
$stmt->store_result();

if ($stmt->num_rows > 0) {
    echo json_encode(['success' => false, 'message' => 'Email already registered']);
    $stmt->close();
    exit();
}
$stmt->close();

// Hash password
$hash = password_hash($password, PASSWORD_DEFAULT);

// Insert user
$ins = $conn->prepare("INSERT INTO users (full_name, email, password, created_at) VALUES (?, ?, ?, NOW())");
$ins->bind_param('sss', $fullName, $email, $hash);

if ($ins->execute()) {
    $_SESSION['logged_in'] = true;
    $_SESSION['user_id'] = $conn->insert_id;
    $_SESSION['full_name'] = $fullName;
    $_SESSION['email'] = $email;

    echo json_encode(['success' => true, 'message' => 'Account created successfully']);
} else {
    echo json_encode(['success' => false, 'message' => 'Signup failed: ' . $conn->error]);
}

$ins->close();
$conn->close();
exit();
?>
