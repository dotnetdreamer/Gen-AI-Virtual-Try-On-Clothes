import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Select } from 'antd'; 
import Webcam from 'react-webcam';
import {
  Layout,
  ConfigProvider,
  theme,
  Button,
  Typography,
  Space,
  Switch,
  Input,
  Row,
  Col,
  Divider,
} from "antd";
import {
  BulbOutlined,
  BulbFilled,
  GithubOutlined,
  LinkedinOutlined,
  CameraOutlined,
  UploadOutlined,
} from "@ant-design/icons";

import ImageUpload from "./components/ImageUpload";
import Footer from './components/Footer'; 
const { Header, Content} = Layout;
const { Title, Text } = Typography;

function App() {
  const [personImage, setPersonImage] = useState(null);
  const [clothImage, setClothImage] = useState(null);
  const [instructions, setInstructions] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedMode = localStorage.getItem("darkMode");
    return savedMode ? JSON.parse(savedMode) : false;
  });
  const [cameraMode, setCameraMode] = useState(false);
  const [capturedImagePreview, setCapturedImagePreview] = useState(null);
  const [garmentCameraMode, setGarmentCameraMode] = useState(false);
  const [capturedGarmentPreview, setCapturedGarmentPreview] = useState(null);

  const [modelType, setModelType] = useState("full");
  const [gender, setGender] = useState("male");
  const [garmentType, setGarmentType] = useState("shalwar_kameez");
  const [style, setStyle] = useState("traditional");
  const [background, setBackground] = useState("studio");

  const { Option } = Select;

  const resultRef = useRef(null);
  const webcamRef = useRef(null);
  const garmentWebcamRef = useRef(null);

  const { defaultAlgorithm, darkAlgorithm } = theme;

  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  useEffect(() => {
    if (result && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [result]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!personImage || !clothImage) {
      toast.error("Please upload both person and cloth images");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("person_image", personImage);
    formData.append("cloth_image", clothImage);
    formData.append("instructions", instructions);
    
    // Add dropdown values to form data
    formData.append("model_type", modelType || "");
    formData.append("gender", gender || "");
    formData.append("garment_type", garmentType || "");
    formData.append("style", style || "");
    formData.append("background", background || "");

    try {
      const response = await axios.post("http://localhost:8000/api/try-on", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const newResult = {
        id: Date.now(),
        resultImage: response.data.image,
        text: response.data.text,
        timestamp: new Date().toLocaleString(),
      };

      setResult(newResult);
      setHistory((prev) => [newResult, ...prev]);
      toast.success("Virtual try-on completed successfully!");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "An error occurred during processing"
      );
    } finally {
      setLoading(false);
    }
  };

  const capturePhoto = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    if (imageSrc) {
      // Set the preview URL immediately
      setCapturedImagePreview(imageSrc);
      
      // Convert base64 to Blob
      fetch(imageSrc)
        .then(res => res.blob())
        .then(blob => {
          // Create a File object from the Blob
          const file = new File([blob], "camera-capture.jpg", { type: "image/jpeg" });
          setPersonImage(file);
          setCameraMode(false);
          toast.success("Photo captured successfully!");
        })
        .catch(err => {
          toast.error("Failed to process the captured image");
          console.error(err);
        });
    }
  };

  const captureGarmentPhoto = () => {
    const imageSrc = garmentWebcamRef.current.getScreenshot();
    if (imageSrc) {
      // Set the preview URL immediately
      setCapturedGarmentPreview(imageSrc);
      
      // Convert base64 to Blob
      fetch(imageSrc)
        .then(res => res.blob())
        .then(blob => {
          // Create a File object from the Blob
          const file = new File([blob], "garment-capture.jpg", { type: "image/jpeg" });
          setClothImage(file);
          setGarmentCameraMode(false);
          toast.success("Garment photo captured successfully!");
        })
        .catch(err => {
          toast.error("Failed to process the captured garment image");
          console.error(err);
        });
    }
  };

  // Clear captured preview when switching to upload mode
  useEffect(() => {
    if (!cameraMode) {
      // Don't clear the preview if we have just captured an image
      if (!capturedImagePreview) {
        setCapturedImagePreview(null);
      }
    }
  }, [cameraMode]);
  
  // Clear captured garment preview when switching to upload mode
  useEffect(() => {
    if (!garmentCameraMode) {
      // Don't clear the preview if we have just captured an image
      if (!capturedGarmentPreview) {
        setCapturedGarmentPreview(null);
      }
    }
  }, [garmentCameraMode]);
  
  const bgColor = isDarkMode ? "#0f0f0f" : "#f9fafb";
  const cardColor = isDarkMode ? "#1c1c1c" : "#ffffff";
  const textColor = isDarkMode ? "#e4e4e4" : "#111827";
  const subText = isDarkMode ? "#9ca3af" : "#4b5563";

  return (
    <ConfigProvider
      theme={{
        algorithm: isDarkMode ? darkAlgorithm : defaultAlgorithm,
        token: {
          colorPrimary: "#0ea5e9",
          borderRadius: 10,
        },
      }}
    >
      <Layout style={{ minHeight: "100vh", background: bgColor }}>
        <Header
          style={{
            background: "transparent",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "1.5rem 2rem",
          }}
        >
          <Title level={3} style={{ margin: 0, color: textColor }}>
            👗 Virtual Try-On
          </Title>
          <Switch
            checked={isDarkMode}
            onChange={setIsDarkMode}
            checkedChildren={<BulbFilled />}
            unCheckedChildren={<BulbOutlined />}
          />
        </Header>
        <Content style={{ padding: "2rem 1rem" }}>
          <div className="max-w-5xl mx-auto">
            <Title
              level={1}
              className="text-center"
              style={{ color: textColor, marginBottom: 40 }}
            >
              Try-On Clothes in Seconds
            </Title>

            <form onSubmit={handleSubmit}>
              <Row gutter={[24, 24]}>
                {/* Model Section */}
                <Col xs={24} md={12}>
                  <div
                    style={{
                      background: cardColor,
                      padding: 24,
                      borderRadius: 12,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                      <Title
                        level={4}
                        style={{ color: textColor, margin: 0 }}
                      >
                        Model Image
                      </Title>
                      <Space>
                        <Button 
                          type={cameraMode ? "default" : "primary"}
                          icon={<UploadOutlined />}
                          onClick={() => setCameraMode(false)}
                        >
                          Upload
                        </Button>
                        <Button
                          type={cameraMode ? "primary" : "default"}
                          icon={<CameraOutlined />}
                          onClick={() => setCameraMode(true)}
                        >
                          Camera
                        </Button>
                      </Space>
                    </div>

                    {cameraMode ? (
                      <div style={{ marginBottom: 16 }}>
                        <Webcam
                          audio={false}
                          ref={webcamRef}
                          screenshotFormat="image/jpeg"
                          style={{ 
                            width: '100%', 
                            borderRadius: 8,
                            border: `1px solid ${isDarkMode ? '#333' : '#d1d5db'}`
                          }}
                        />
                        <Button
                          type="primary"
                          onClick={capturePhoto}
                          style={{ 
                            width: '100%', 
                            marginTop: 8,
                            height: 40 
                          }}
                        >
                          Capture Photo
                        </Button>
                      </div>
                    ) : (
                      <>
                        {capturedImagePreview ? (
                          <div style={{ marginBottom: 16 }}>
                            <div style={{ 
                              position: 'relative',
                              marginBottom: 8 
                            }}>
                              <img 
                                src={capturedImagePreview} 
                                alt="Captured"
                                style={{ 
                                  width: '100%', 
                                  borderRadius: 8,
                                  border: `1px solid ${isDarkMode ? '#333' : '#d1d5db'}`
                                }}
                              />
                              <div style={{ 
                                position: 'absolute', 
                                top: 8, 
                                right: 8 
                              }}>
                                <Button 
                                  type="primary" 
                                  shape="circle" 
                                  size="small"
                                  onClick={() => {
                                    setCapturedImagePreview(null);
                                    setPersonImage(null);
                                  }}
                                  danger
                                >
                                  X
                                </Button>
                              </div>
                            </div>
                            <Text style={{ color: subText }}>
                              Captured Image
                            </Text>
                            <div style={{ marginTop: 8 }}>
                              <Button 
                                type="default"
                                onClick={() => {
                                  setCameraMode(true);
                                  setCapturedImagePreview(null);
                                }}
                                style={{ width: '100%' }}
                              >
                                Take Another Photo
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <ImageUpload
                            label="Upload Model Image"
                            onImageChange={setPersonImage}
                            isDarkMode={isDarkMode}
                          />
                        )}
                      </>
                    )}

                    <div className="mt-6 space-y-4">
                      {/* Model Type */}
                      <div>
                        <Text style={{ color: subText }}>Model Type</Text>
                        <Select
                          placeholder="Select model type"
                          style={{ width: "100%", marginTop: 4 }}
                          value={modelType}
                          onChange={setModelType}
                        >
                          <Option value="top">Top Half</Option>
                          <Option value="bottom">Bottom Half</Option>
                          <Option value="full">Full Body</Option>
                        </Select>
                      </div>

                      {/* Gender */}
                      <div>
                        <Text style={{ color: subText }}>Gender</Text>
                        <Select
                          placeholder="Select gender"
                          style={{ width: "100%", marginTop: 4 }}
                          value={gender}
                          onChange={setGender}
                        >
                          <Option value="male">Male</Option>
                          <Option value="female">Female</Option>
                          <Option value="unisex">Unisex</Option>
                        </Select>
                      </div>
                    </div>
                  </div>
                </Col>

                {/* Garment Section */}
                <Col xs={24} md={12}>
                  <div
                    style={{
                      background: cardColor,
                      padding: 24,
                      borderRadius: 12,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                      <Title
                        level={4}
                        style={{ color: textColor, margin: 0 }}
                      >
                        Garment Image
                      </Title>
                      <Space>
                        <Button 
                          type={garmentCameraMode ? "default" : "primary"}
                          icon={<UploadOutlined />}
                          onClick={() => setGarmentCameraMode(false)}
                        >
                          Upload
                        </Button>
                        <Button
                          type={garmentCameraMode ? "primary" : "default"}
                          icon={<CameraOutlined />}
                          onClick={() => setGarmentCameraMode(true)}
                        >
                          Camera
                        </Button>
                      </Space>
                    </div>

                    {garmentCameraMode ? (
                      <div style={{ marginBottom: 16 }}>
                        <Webcam
                          audio={false}
                          ref={garmentWebcamRef}
                          screenshotFormat="image/jpeg"
                          style={{ 
                            width: '100%', 
                            borderRadius: 8,
                            border: `1px solid ${isDarkMode ? '#333' : '#d1d5db'}`
                          }}
                        />
                        <Button
                          type="primary"
                          onClick={captureGarmentPhoto}
                          style={{ 
                            width: '100%', 
                            marginTop: 8,
                            height: 40 
                          }}
                        >
                          Capture Garment Photo
                        </Button>
                      </div>
                    ) : (
                      <>
                        {capturedGarmentPreview ? (
                          <div style={{ marginBottom: 16 }}>
                            <div style={{ 
                              position: 'relative',
                              marginBottom: 8 
                            }}>
                              <img 
                                src={capturedGarmentPreview} 
                                alt="Captured Garment"
                                style={{ 
                                  width: '100%', 
                                  borderRadius: 8,
                                  border: `1px solid ${isDarkMode ? '#333' : '#d1d5db'}`
                                }}
                              />
                              <div style={{ 
                                position: 'absolute', 
                                top: 8, 
                                right: 8 
                              }}>
                                <Button 
                                  type="primary" 
                                  shape="circle" 
                                  size="small"
                                  onClick={() => {
                                    setCapturedGarmentPreview(null);
                                    setClothImage(null);
                                  }}
                                  danger
                                >
                                  X
                                </Button>
                              </div>
                            </div>
                            <Text style={{ color: subText }}>
                              Captured Garment Image
                            </Text>
                            <div style={{ marginTop: 8 }}>
                              <Button 
                                type="default"
                                onClick={() => {
                                  setGarmentCameraMode(true);
                                  setCapturedGarmentPreview(null);
                                }}
                                style={{ width: '100%' }}
                              >
                                Take Another Garment Photo
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <ImageUpload
                            label="Upload Cloth Image"
                            onImageChange={setClothImage}
                            isDarkMode={isDarkMode}
                          />
                        )}
                      </>
                    )}

                    <div className="mt-6 space-y-4">
                      {/* Garment Type */}
                      <div>
                        <Text style={{ color: subText }}>Garment Type</Text>
                        <Select
                          placeholder="Select garment type"
                          style={{ width: "100%", marginTop: 4 }}
                          value={garmentType}
                          onChange={setGarmentType}
                        >
                          <Option value="shirt">Shirt</Option>
                          <Option value="pants">Pants</Option>
                          <Option value="jacket">Jacket</Option>
                          <Option value="dress">Dress</Option>
                          <Option value="tshirt">T-shirt</Option>
                          <Option value="shalwar_kameez">Shalwar Kameez</Option>
                        </Select>
                      </div>

                      {/* Style */}
                      <div>
                        <Text style={{ color: subText }}>Style</Text>
                        <Select
                          placeholder="Select style"
                          style={{ width: "100%", marginTop: 4 }}
                          value={style}
                          onChange={setStyle}
                        >
                          <Option value="casual">Casual</Option>
                          <Option value="formal">Formal</Option>
                          <Option value="streetwear">Streetwear</Option>
                          <Option value="traditional">Traditional</Option>
                          <Option value="sports">Sportswear</Option>
                        </Select>
                      </div>
                      
                      {/* Background */}
                      <div>
                        <Text style={{ color: subText }}>Background</Text>
                        <Select
                          placeholder="Select background"
                          style={{ width: "100%", marginTop: 4 }}
                          value={background}
                          onChange={setBackground}
                        >
                          <Option value="studio">Studio</Option>
                          <Option value="nature">Nature</Option>
                          <Option value="city">City</Option>
                          <Option value="beach">Beach</Option>
                          <Option value="indoors">Indoors</Option>
                          <Option value="fashion_runway">Fashion Runway</Option>
                        </Select>
                      </div>
                    </div>
                  </div>
                </Col>
              </Row>

              {/* Instructions */}
              <div style={{ marginTop: "2.5rem" }}>
                <Title
                  level={5}
                  style={{ color: textColor, marginBottom: "0.5rem" }}
                >
                  Special Instructions
                </Title>
                <Input.TextArea
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  rows={4}
                  placeholder="e.g. Fit for walking pose, crop top, side view preferred..."
                  style={{
                    borderRadius: 10,
                    padding: "1rem",
                    fontSize: "1rem",
                    backgroundColor: isDarkMode ? "#1f1f1f" : "#ffffff",
                    color: textColor,
                    borderColor: isDarkMode ? "#333" : "#d1d5db",
                  }}
                />
              </div>

              {/* Submit Button */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginTop: "3rem",
                }}
              >
                <Button
                  type="primary"
                  size="large"
                  htmlType="submit"
                  loading={loading}
                  style={{
                    height: 48,
                    width: 200,
                    fontSize: 16,
                    borderRadius: 8,
                  }}
                >
                  {loading ? "Processing..." : "Try On"}
                </Button>
              </div>
            </form>

            {result && (
              <div ref={resultRef} className="mt-20">
                <Divider />
                <Title
                  level={3}
                  style={{
                    color: textColor,
                    textAlign: "center",
                    marginBottom: 32,
                  }}
                >
                  Your Try-On Result
                </Title>
                <div className="flex justify-center">
                  <img
                    src={result.resultImage}
                    alt="Try-On Result"
                    style={{
                      borderRadius: 16,
                      boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
                      maxHeight: 480,
                    }}
                  />
                </div>
                <Text
                  style={{
                    display: "block",
                    textAlign: "center",
                    marginTop: 16,
                    color: isDarkMode ? "#ffffff" : "#000000",
                    fontSize: "1.25rem",
                    fontWeight: "600"
                  }}
                >
                  {result.text}
                </Text>
              </div>
            )}

            {history.length > 0 && (
              <div className="mt-24">
                <Divider />
                <Title level={3} style={{ color: textColor, marginBottom: 32 }}>
                  Previous Results
                </Title>
                <Row gutter={[24, 24]}>
                  {history.map((item) => (
                    <Col xs={24} sm={12} md={8} key={item.id}>
                      <div
                        style={{
                          background: cardColor,
                          padding: 16,
                          borderRadius: 12,
                        }}
                      >
                        <img
                          src={item.resultImage}
                          alt="Previous"
                          style={{
                            width: "100%",
                            borderRadius: 10,
                            marginBottom: 12,
                          }}
                        />
                        <Text
                          style={{
                            display: "block",
                            color: isDarkMode ? "#ffffff" : "#000000",
                            fontSize: "1.25rem",
                            fontWeight: "600",
                            marginBottom: 4,
                          }}
                        >
                          {item.text}
                        </Text>
                        <Text
                          style={{
                            color: isDarkMode ? "#777" : "#666",
                            fontSize: 12,
                          }}
                        >
                          {item.timestamp}
                        </Text>
                      </div>
                    </Col>
                  ))}
                </Row>
              </div>
            )}
          </div>
        </Content>

        <Footer isDarkMode={isDarkMode} />

        <ToastContainer theme={isDarkMode ? "dark" : "light"} />
      </Layout>
    </ConfigProvider>
  );
}

export default App;
