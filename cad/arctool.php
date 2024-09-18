<?php
// Your ArcGIS service URL
$arcgisServiceUrl = 'https://lis.survey.gov.lk:6443/arcgis/rest/services/Publishing_Server/CADEXTRACT_PRO/GPServer/CadExtract_V02';


// Function to perform HTTP POST request
function postRequest($url, $data) {
    $options = [
        'http' => [
            'header'  => "Content-type: application/x-www-form-urlencoded\r\n",
            'method'  => 'POST',
            'content' => http_build_query($data)
        ]
    ];
    $context  = stream_context_create($options);
    return file_get_contents($url, false, $context);
}

// Function to perform HTTP GET request
function getRequest($url) {
    return file_get_contents($url);
}

// Check if the form is submitted
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $parcelID = $_POST['ParcelID'];
    $scale = $_POST['Scale'];
    $outoutType = $_POST['outoutType'];

    // Construct URL for job submission
    $submitJobUrl = "{$arcgisServiceUrl}/submitJob";
    $postData = [
        'ParcelID' => $parcelID,
        'Scale' => $scale,
        'OutoutType' => $outoutType,
        'f' => 'json'
    ];

    $result = postRequest($submitJobUrl, $postData);
    $resultJson = json_decode($result, true);

    if (isset($resultJson['jobId'])) {
        $jobId = $resultJson['jobId'];
        echo "<p>Job Submitted. Job ID: $jobId</p>";

        // Check job status
        $jobStatusUrl = "{$arcgisServiceUrl}/jobs/{$jobId}?f=json";
        $statusResult = getRequest($jobStatusUrl);
        $statusJson = json_decode($statusResult, true);

        if (isset($statusJson['jobStatus'])) {
            $jobStatus = $statusJson['jobStatus'];
            $progress = $statusJson['progress'] ?? 0;
            echo "<p>Job Status: $jobStatus</p>";
            echo "<p>Progress: $progress%</p>";

            if ($jobStatus === "esriJobSucceeded") {
                // Retrieve outout if job succeeded
                $outoutResultUrl = "{$arcgisServiceUrl}/jobs/{$jobId}/results/outfile?f=json";
                $outoutResult = getRequest($outoutResultUrl);
                $outoutJson = json_decode($outoutResult, true);
                $outoutFileUrl = $outoutJson['value']['url'] ?? '';
                echo "<p><a href='$outoutFileUrl' download>Download outout</a></p>";
            }
        } else {
            echo "<p>Error retrieving job status.</p>";
        }
    } else {
        echo "<p>Error submitting job.</p>";
    }
}
?>
