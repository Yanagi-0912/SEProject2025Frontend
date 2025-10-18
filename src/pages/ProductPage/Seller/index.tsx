interface SellerProps {
    sellerID?: string;
    onBack?: () => void;
}

function Seller(props: SellerProps) {
    //api fetch seller info by props.sellerID

    return (
      <div>
        賣家資訊
        <div>賣家ID: {props.sellerID}</div>
      </div>
    );
}
export default Seller;