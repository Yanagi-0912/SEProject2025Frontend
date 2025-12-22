workspace "SEProject2025" "軟體工程專案2025 - 線上拍賣系統"{
    !identifiers hierarchical

    model {
        // People
        buyer = person "買家" "瀏覽、直購、競標商品，管理購物車與訂單"
        seller = person "賣家" "上架、編輯、刪除、下架商品，管理拍賣"
        // Software System
        ss = softwareSystem "線上拍賣系統""提供商品瀏覽、競標、直購與管理功能" {
            wa = container "Web Application""React+Typescript"{
                LogInPage = component "登入頁面""用戶登入系統"
                HomePage = component "首頁""顯示熱門商品"
                ProductPage = component "商品頁面""顯示商品詳細資訊"
                CartPage = component "購物車頁面""管理購物車商品"
                CheckoutPage = component "結帳頁面""處理訂單結帳流程"
                UserProfilePage = component "用戶資料頁面""管理用戶個人資訊"
                SellerDashboard = component "賣家後台""管理商品與拍賣"
                HistoryPage = component "歷史紀錄頁面""查看用戶歷史紀錄"
                CouponPage = component "優惠券頁面""管理用戶優惠券"
                MessageSystem = component "訊息系統""用戶間即時通訊"
                FavoritePage = component "收藏頁面""管理用戶收藏清單"
            }
            ba = container "Backend API""Spring Boot"{
                group "Product Module"{
                    ProductController = component "Product Controller""處理商品相關 HTTP 請求"
                    ProductService = component "Product Service""處理商品相關業務邏輯"
                    ProductRepository = component "Product Repository""存取商品相關資料"
                }
                group "User Module" {
                    UserController = component "User Controller""處理用戶相關 HTTP 請求"
                    UserService = component "User Service""處理用戶相關業務邏輯"
                    UserRepository = component "User Repository""存取用戶相關資料"
                    AuthController = component "Auth Controller""處理認證相關 HTTP 請求"
                    AuthService = component "Auth Service""處理認證相關業務邏輯"
                }
                group "Message Module" {
                    MessageController = component "Message Controller""處理訊息相關 HTTP 請求"
                    MessageService = component "Message Service""處理訊息相關業務邏輯"
                    MessageRepository = component "Message Repository""存取訊息相關資料"
                }
                group "Auction Module" {
                    AuctionController = component "Auction Controller""處理競標相關 HTTP 請求"
                    AuctionService = component "Auction Service""處理競標相關業務邏輯"
                    AuctionRepository = component "Auction Repository""存取競標相關資料"
                }
                group "Cart Module" {
                    CartController = component "Cart Controller""處理購物車相關 HTTP 請求"
                    CartService = component "Cart Service""處理購物車相關業務邏輯"
                    CartRepository = component "Cart Repository""存取購物車相關資料"
                }
                group "Order Module" {
                    OrderController = component "Order Controller""處理訂單相關 HTTP 請求"
                    OrderService = component "Order Service""處理訂單相關業務邏輯"
                    OrderRepository = component "Order Repository""存取訂單相關資料"
                }
                group "History Module" {
                    HistoryController = component "History Controller""處理歷史紀錄相關 HTTP 請求"
                    HistoryService = component "History Service""處理歷史紀錄相關業務邏輯"
                    HistoryRepository = component "History Repository""存取歷史紀錄相關資料"
                }
                group "Review Module" {
                    ReviewController = component "Review Controller""處理評價相關 HTTP 請求"
                    ReviewService = component "Review Service""處理評價相關業務邏輯"
                    ReviewRepository = component "Review Repository""存取評價相關資料"
                }
                group "Coupon Module" {
                    CouponController = component "Coupon Controller""處理優惠券相關 HTTP 請求"
                    CouponService = component "Coupon Service""處理優惠券相關業務邏輯"
                    CouponRepository = component "Coupon Repository""存取優惠券相關資料"
                }
                group "Image Module" {
                    ImageController = component "Image Controller""處理圖片相關 HTTP 請求"
                    ImageService = component "Image Service""處理圖片相關業務邏輯"
                }
                group "Search Module" {
                    SearchController = component "Search Controller""處理搜尋相關 HTTP 請求"
                    SearchService = component "Search Service""處理搜尋相關業務邏輯"
                }
                group "Bid Module" {
                    BidController = component "Bid Controller""處理出價相關 HTTP 請求"
                    BidService = component "Bid Service""處理出價相關業務邏輯"
                    BidRepository = component "Bid Repository""存取出價相關資料"
                }
                group "Favorite Module"{
                    FavoriteController = component "Favorite Controller""處理收藏相關 HTTP 請求"
                    FavoriteService = component "Favorite Service""處理收藏相關業務邏輯"
                    FavoriteRepository = component "Favorite Repository""存取收藏相關資料"
                }
            }
            db = container "Database Schema""MongoDB" {
                tags "Database"
            }
        }

        // External Software Systems
        rag = softwareSystem "RAG 搜尋系統" "Python Flask + RAG，用於語意搜尋與推薦" {
            tags "External"
        }

        imageCdn = softwareSystem "圖片 CDN 系統" "GitHub Repository + jsDelivr，用於圖片上傳與全球快取" {
            tags "External"
        }


        // Context Diagram
        buyer -> ss.wa "瀏覽商品、出價競標、直購、結帳"
        seller -> ss.wa "管理商品、上架與下架"

        // External System Relationships (Context)
        ss.wa -> rag "呼叫 RAG API 進行語意搜尋 / 推薦"
        ss.wa -> imageCdn "透過 jsDelivr 載入商品圖片"
        ss.ba -> imageCdn "上傳與管理商品圖片（GitHub API）"

        // Container Diagram
        ss.wa -> ss.ba "處理業務邏輯與資料交換"
        ss.ba -> ss.db "存取用戶、商品、訂單與競標資料"

        //Backend Component Diagram
        ss.ba.ProductController -> ss.ba.ProductService "調用商品服務"
        ss.ba.ProductService -> ss.ba.ProductRepository "存取商品資料"
        ss.ba.UserController -> ss.ba.UserService "調用用戶服務"
        ss.ba.UserService -> ss.ba.UserRepository "存取用戶資料"
        ss.ba.MessageController -> ss.ba.MessageService "調用訊息服務"
        ss.ba.MessageService -> ss.ba.MessageRepository "存取訊息資料"
        ss.ba.AuctionController -> ss.ba.AuctionService "調用競標服務"
        ss.ba.AuctionService -> ss.ba.AuctionRepository "存取競標資料"
        ss.ba.CartController -> ss.ba.CartService "調用購物車與直購服務"
        ss.ba.CartService -> ss.ba.CartRepository "存取購物車與直購資料"
        ss.ba.OrderController -> ss.ba.OrderService "調用訂單服務"
        ss.ba.OrderService -> ss.ba.OrderRepository "存取訂單資料"
        ss.ba.HistoryController -> ss.ba.HistoryService "調用歷史紀錄服務"
        ss.ba.HistoryService -> ss.ba.HistoryRepository "存取歷史紀錄資料"
        ss.ba.ReviewController -> ss.ba.ReviewService "調用評價服務"
        ss.ba.ReviewService -> ss.ba.ReviewRepository "存取評價資料"
        ss.ba.CouponController -> ss.ba.CouponService "調用優惠券服務"
        ss.ba.CouponService -> ss.ba.CouponRepository "存取優惠券資料"
        ss.ba.AuthController -> ss.ba.AuthService "調用認證服務"
        ss.ba.ImageController -> ss.ba.ImageService "調用圖片服務"
        ss.ba.SearchController -> ss.ba.SearchService "調用搜尋服務"
        ss.ba.BidController -> ss.ba.BidService "調用出價服務"
        ss.ba.BidService -> ss.ba.BidRepository "存取出價資料"
        //Backend Components Dependencies
        ss.ba.ProductService -> ss.ba.UserService "查詢賣家資訊"
        ss.ba.UserService -> ss.ba.ProductService "查詢用戶擁有商品資料"
        ss.ba.MessageService -> ss.ba.UserService "查詢用戶資訊"
        ss.ba.AuthService -> ss.ba.UserRepository "存取用戶資料"
        ss.ba.AuctionService -> ss.ba.ProductService "查詢商品資訊"
        ss.ba.UserService -> ss.ba.CartService "查詢用戶購物車資料"
        ss.ba.CartService -> ss.ba.ProductService "查詢商品資訊"
        ss.ba.OrderService -> ss.ba.CartService "處理購物車資料"
        ss.ba.HistoryService -> ss.ba.UserService "查詢用戶資訊"
        ss.ba.HistoryService -> ss.ba.OrderService "查詢訂單資訊"
        ss.ba.HistoryService -> ss.ba.AuctionService "查詢競標資訊"
        ss.ba.HistoryService -> ss.ba.ProductService "查詢商品資訊"
        ss.ba.HistoryService -> ss.ba.ReviewService "查詢評價資訊"
        ss.ba.ReviewService -> ss.ba.UserService "查詢用戶資訊"
        ss.ba.ReviewService -> ss.ba.ProductService "查詢商品資訊"
        ss.ba.CouponService -> ss.ba.UserService "查詢用戶資訊"
        ss.ba.BidService -> ss.ba.UserService "查詢用戶資訊"
        ss.ba.BidService -> ss.ba.AuctionService "查詢競標資訊"
        ss.ba.BidService -> ss.ba.ProductService "查詢商品資訊"
        ss.ba.CouponService -> ss.ba.OrderService "查詢訂單資訊"
        ss.ba.FavoriteService -> ss.ba.UserService "查詢用戶資訊"
        ss.ba.FavoriteService -> ss.ba.ProductService "查詢商品資訊"

        //Frontend Component Diagram
        ss.wa.LogInPage -> ss.wa.HomePage "導向首頁"
        ss.wa.HomePage -> ss.wa.ProductPage "導向商品頁面"
        ss.wa.ProductPage -> ss.wa.CartPage "導向購物車頁面"
        ss.wa.CartPage -> ss.wa.CheckoutPage "導向結帳頁面"
        ss.wa.HomePage -> ss.wa.UserProfilePage "導向用戶資料頁面"
        ss.wa.UserProfilePage -> ss.wa.SellerDashboard "導向賣家後台"
        ss.wa.UserProfilePage -> ss.wa.HistoryPage "導向歷史紀錄頁面"
        ss.wa.UserProfilePage -> ss.wa.CouponPage "導向優惠券頁面"
        ss.wa.UserProfilePage -> ss.wa.HomePage "返回首頁"
        ss.wa.HomePage -> ss.wa.FavoritePage "導向收藏頁面"
        ss.wa.CheckoutPage -> ss.wa.MessageSystem "導向訊息系統"
        ss.wa.MessageSystem -> ss.wa.HomePage "返回首頁"
    }

    views {
        systemContext ss "ContextDiagram" {
            include *
            autolayout lr
            title "線上拍賣系統 - 系統情境圖 (Context Diagram)"
        }

        container ss "ContainerDiagram" {
            include *
            autolayout lr
            title "線上拍賣系統 - 容器圖 (Container Diagram)"
            
        }

        component ss.ba "BackendComponentDiagram" {
            include *
            autolayout lr
            title "線上拍賣系統 - 後端元件圖 (Backend Component Diagram)"
        }

        component ss.wa "FrontendComponentDiagram" {
            include *
            autolayout lr
            title "線上拍賣系統 - 前端元件圖 (Frontend Component Diagram)"
        }

        styles {
            element "Element" {
                color #0773af
                stroke #0773af
                strokeWidth 7
                shape roundedbox
            }
            element "Person" {
                shape person
            }
            element "Database" {
                shape cylinder
            }
            element "Boundary" {
                strokeWidth 5
            }
            relationship "Relationship" {
                thickness 4
            }
        }
    }
}