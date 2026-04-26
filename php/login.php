<?php
// login.php
header('Content-Type: application/json');
$input = json_decode(file_get_contents('php://input'), true);

if (!$input || !isset($input['username']) || !isset($input['password'])) {
    http_response_code(400);
    echo json_encode(['error' => '请输入用户名和密码']);
    exit;
}

$username = $input['username'];
$password = $input['password'];

$usersJson = file_get_contents('../data/users.json');
$users = json_decode($usersJson, true);

foreach ($users as $user) {
    if ($user['username'] === $username && $user['password'] === $password) {
        unset($user['password']);
        echo json_encode($user);
        exit;
    }
}

http_response_code(401);
echo json_encode(['error' => '用户名或密码错误']);
?>
