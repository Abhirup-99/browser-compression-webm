import { useState, useRef, useEffect, ChangeEvent } from "react";
import { Button, Progress, message, Flex } from "antd";

const VideoCompression = () => {
  const [sourceVideo, setSourceVideo] = useState<File | null>(null);
  const [compressedVideo, setCompressedVideo] = useState<Blob | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [width, setWidth] = useState<string>("");
  const [height, setHeight] = useState<string>("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (sourceVideo) {
      const video = document.createElement("video");
      video.onloadedmetadata = () => {
        setWidth(video.videoWidth.toString());
        setHeight(video.videoHeight.toString());
      };
      video.src = URL.createObjectURL(sourceVideo);
    }
  }, [sourceVideo]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return;
    const file = event.target.files[0];
    if (file && file.type.startsWith("video/")) {
      setSourceVideo(file);
      setCompressedVideo(null);
    } else {
      message.error("Please select a valid video file.");
    }
  };

  const compressVideo = async () => {
    if (!sourceVideo) {
      message.error("Please upload a video first.");
      return;
    }

    setIsCompressing(true);
    setProgress(0);

    try {
      // @ts-ignore
      const stream = videoRef.current?.captureStream();
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "video/webm",
        videoBitsPerSecond: 1000000,
      });

      const chunks: BlobPart[] = [];
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: "video/webm" });
        setCompressedVideo(blob);
        setIsCompressing(false);
        setProgress(100);
      };

      if (!videoRef.current) return;
      videoRef.current.onloadedmetadata = () => {
        videoRef.current!.muted = true;
        videoRef.current?.play();
        mediaRecorder.start();
      };

      videoRef.current.onended = () => {
        mediaRecorder.stop();
        videoRef.current?.pause();
      };

      videoRef.current.ontimeupdate = () => {
        if (!videoRef.current) return;
        const progress =
          (videoRef.current.currentTime / videoRef.current.duration) * 100;
        setProgress(progress);
      };

      if (!videoRef.current) return;
      videoRef.current.width = Number.parseFloat(width);
      videoRef.current.height = Number.parseFloat(height);

      videoRef.current.src = URL.createObjectURL(sourceVideo);
    } catch (err) {
      message.error("Error compressing video: " + (err as Error).message);
      setIsCompressing(false);
    }
  };

  const downloadCompressedVideo = () => {
    if (compressedVideo) {
      const url = URL.createObjectURL(compressedVideo);
      const a = document.createElement("a");
      a.href = url;
      a.download = "compressed_video.webm";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <Flex
      gap="middle"
      vertical
      justify="center"
      align="center"
      style={{ height: "100vh", backgroundColor: "#f0f2f5" }}
    >
      <div
        style={{
          width: "fit-content",
          backgroundColor: "white",
          padding: "40px",
          borderRadius: "20px",
          margin: "20px",
        }}
      >
        <h1
          style={{ marginTop: "0", textAlign: "center", marginBottom: "40px" }}
        >
          Video Compression
        </h1>
        <div>
          {!sourceVideo && (
            <>
              <input
                type="file"
                accept="video/*"
                style={{ display: "none" }}
                onChange={handleFileChange}
                ref={inputRef}
              />
              <Button onClick={() => inputRef.current?.click()}>
                Select Video
              </Button>
            </>
          )}
        </div>

        {sourceVideo && (
          <div>
            <p style={{ wordBreak: "break-word" }}>
              Selected: {sourceVideo.name}
            </p>
          </div>
        )}

        {sourceVideo && !compressedVideo && (
          <Button type="primary" onClick={compressVideo}>
            Resize & Compress
          </Button>
        )}

        {isCompressing && (
          <Progress percent={Number.parseFloat(progress.toFixed(2))} />
        )}

        {compressedVideo && (
          <Button onClick={downloadCompressedVideo} type="primary">
            Download Compressed Video
          </Button>
        )}

        <video ref={videoRef} style={{ display: "none" }} />
      </div>
    </Flex>
  );
};

export default VideoCompression;
