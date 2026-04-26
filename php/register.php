<?php
// register.php
header('Content-Type: application/json');
$input = json_decode(file_get_contents('php://input'), true);

if (!$input || !isset($input['username']) || !isset($input['password'])) {
    http_response_code(400);
    echo json_encode(['error' => '无效的输入']);
    exit;
}

$username = $input['username'];
$password = $input['password'];
$nickname = isset($input['nickname']) ? $input['nickname'] : $username;

$usersJson = file_get_contents('../data/users.json');
$users = json_decode($usersJson, true);

foreach ($users as $user) {
    if ($user['username'] === $username) {
        http_response_code(400);
        echo json_encode(['error' => '用户名已存在']);
        exit;
    }
}

$newUser = [
    'id' => 'u' . time(),
    'username' => $username,
    'password' => $password,
    'nickname' => $nickname,
    'balance' => 100.0,
    'avatar' => 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'
];

$users[] = $newUser;
file_put_contents('../data/users.json', json_encode($users, JSON_PRETTY_PRINT));

echo json_encode(['message' => '注册成功']);
?>
