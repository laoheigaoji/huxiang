<?php
// profile.php
header('Content-Type: application/json');

// In a real PHP app, you would use session_start() and check $_SESSION['user_id']
// For this demo, we assume the first user is logged in
$usersJson = file_get_contents('../data/users.json');
$users = json_decode($usersJson, true);

if (count($users) > 0) {
    $user = $users[0];
    unset($user['password']);
    echo json_encode($user);
} else {
    http_response_code(401);
    echo json_encode(['error' => '未登录']);
}
?>
