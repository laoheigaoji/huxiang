<?php
// predictions.php
header('Content-Type: application/json');
$id = isset($_GET['id']) ? $_GET['id'] : null;
$json = file_get_contents('../data/predictions.json');
$data = json_decode($json, true);

if ($id) {
    foreach ($data as $item) {
        if ($item['id'] == $id) {
            echo json_encode($item);
            exit;
        }
    }
    http_response_code(404);
    echo json_encode(['error' => 'Not found']);
} else {
    echo $json;
}
?>
