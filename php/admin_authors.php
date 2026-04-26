<?php
// admin_authors.php
header('Content-Type: application/json');
$method = $_SERVER['REQUEST_METHOD'];
$id = isset($_GET['id']) ? $_GET['id'] : null;
$jsonFile = '../data/authors.json';

if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $data = json_decode(file_get_contents($jsonFile), true);
    $input['id'] = (string)time();
    $data[] = $input;
    file_put_contents($jsonFile, json_encode($data, JSON_PRETTY_PRINT));
    echo json_encode($input);
} elseif ($method === 'PUT' && $id) {
    $input = json_decode(file_get_contents('php://input'), true);
    $data = json_decode(file_get_contents($jsonFile), true);
    foreach ($data as &$item) {
        if ($item['id'] == $id) {
            $item = array_merge($item, $input);
            file_put_contents($jsonFile, json_encode($data, JSON_PRETTY_PRINT));
            echo json_encode($item);
            exit;
        }
    }
} elseif ($method === 'DELETE' && $id) {
    $data = json_decode(file_get_contents($jsonFile), true);
    $data = array_filter($data, function($item) use ($id) {
        return $item['id'] != $id;
    });
    file_put_contents($jsonFile, json_encode(array_values($data), JSON_PRETTY_PRINT));
    echo json_encode(['message' => 'Deleted']);
}
?>
